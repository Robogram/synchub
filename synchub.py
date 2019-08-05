from flask import Flask, request, jsonify, redirect
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from werkzeug import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import os, zipfile, base64, shutil, mimetypes, json, datetime, requests, stripe
from random import randint
from PIL import Image
from calendar import monthrange

stripe_keys = {
	'secret_key': 'sk_live',
  	'publishable_key': 'pk_live'
}

# copy from here down
stripe.api_key = stripe_keys['secret_key']

users_dir = ''
repos_size_limit = 15000000
repos_size_limit = str(repos_size_limit)
last_six_digit = len(repos_size_limit) - 6
repos_size_limit = repos_size_limit[:last_six_digit] + "." + repos_size_limit[last_six_digit:]
repos_size_limit = str(round(float(repos_size_limit), 2))

app = Flask(__name__)
mail = Mail(app)

app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = ''
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAIL_SERVER'] = ''
app.config['MAIL_PORT'] = 0
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = ''
app.config['MAIL_PASSWORD'] = ''
db = SQLAlchemy(app)
mail.init_app(app)

class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	userid = db.Column(db.String(50), unique=True)
	username = db.Column(db.String(50), unique=True)
	email = db.Column(db.String(50), unique=True)
	password = db.Column(db.String(100), unique=True)
	repositories = db.Column(db.Text, unique=False)
	firsttime = db.Column(db.Boolean, unique=False)
	useractions = db.Column(db.Text, unique=False)
	monthlypay = db.Column(db.Text, unique=False)
	verified = db.Column(db.Boolean, unique=False)
	creditcard = db.Column(db.Text, unique=True)

	def __init__(self, userid, username, email, password, repositories, firsttime, useractions, monthlypay, verified, creditcard):
		self.userid = userid
		self.username = username
		self.email = email
		self.password = password
		self.repositories = repositories
		self.firsttime = firsttime
		self.useractions = useractions
		self.monthlypay = monthlypay
		self.verified = verified
		self.creditcard = creditcard

	def __repr__(self):
		return '<User %r>' % self.username

def is_overdue(user):
	current_date = str(datetime.datetime.now())
	current_date = current_date.split()[0].split('-')

	monthlypay = json.loads(user.monthlypay)

	previous_time = monthlypay[len(monthlypay) - 1]

	previous_date = previous_time["date"].split('-')
	previous_trial = previous_time["trial"]
	previous_day_sent = previous_time["day_sent"]
	previous_paid = previous_time["paid"]

	previous_year = int(previous_date[0])
	previous_month = int(previous_date[1])
	previous_day = int(previous_date[2])
	current_year = int(current_date[0])
	current_month = int(current_date[1])
	current_day = int(current_date[2])

	previous_num_days = int(str(monthrange(previous_year, previous_month)).split(',')[1].replace(')', ''))
	current_num_days = int(str(monthrange(current_year, current_month)).split(',')[1].replace(')', ''))

	month_day_diff = current_num_days

	if previous_num_days > current_num_days:
		month_day_diff = previous_num_days - current_num_days
		trial_day_diff = current_num_days + month_day_diff
	elif previous_num_days < current_num_days:
		month_day_diff = current_num_days - previous_num_days
		trial_day_diff = previous_num_days + month_day_diff

	if previous_month != current_month:
		if current_year - previous_year <= 1 and ((current_month - previous_month >= 0 and current_month - previous_month <= 1) or (current_month == 1 and previous_month == 12)):
			if current_day > previous_day:
				day_diff = 100
			else:
				day_diff = previous_day - current_day
		else:
			day_diff = 200
	else:
		day_diff = -1

	info = {
		'paid': previous_paid,
		'diff': day_diff,
		'day_sent': previous_day_sent,
		'trial': previous_trial
	}

	return info

def get_size(trial, username):
	directory = users_dir + "/members/" + username
	repos = os.listdir(directory)
	repository = "/" + repos[0] if len(repos) > 0 else ''
	repos_size = 0

	if trial == True:
		for path, dirs, files in os.walk(directory + repository):
			for f in files:
				fp = os.path.join(path, f)
				repos_size += os.path.getsize(fp)
	else:
		for repo in repos:
			repo = "/" + repo if repo != "" else ""
			for path, dirs, files in os.walk(directory + repo):
				for f in files:
					fp = os.path.join(path, f)
					repos_size += os.path.getsize(fp)

	repos_size = str(repos_size)
	last_six_digit = len(repos_size) - 6
	repos_size = repos_size[:last_six_digit] + "." + repos_size[last_six_digit:]
	repos_size = str(round(float(repos_size), 2))

	if trial == True:
		repos_size = repos_size + " of " + repos_size_limit + " MB used"
	else:
		repos_size = repos_size + " of 75 MB used"

	return repos_size

@app.route("/user/welcome")
def welcome():
    return "synchub backend"

# application routes
@app.route("/user/get_committed_files", methods=['POST'])
def get_committed_files():
	userid = request.form['userid']

	current_date = str(datetime.datetime.now())
	current_date = current_date.split()[0].split('-')

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		directory = users_dir + "/members/" + user.username

		files = os.listdir(directory)
		monthlypay = json.loads(user.monthlypay)
		committed_files = []

		for file in files:
			is_dir = os.path.isdir(os.path.join(directory, file))

			if file != '.DS_Store':	
				committed_files.append({ 'file_name': file, 'added': True, 'is_dir': is_dir, 'dir': directory.replace(users_dir + "/members/" + user.username, '') })

		info = is_overdue(user)

		previous_paid = info['paid']
		day_diff = info['diff']
		previous_day_sent = info['day_sent']
		previous_trial = info['trial']

		if previous_paid == "0.00":
			if day_diff >= 0 and day_diff <= 5:
				if day_diff not in previous_day_sent:
					html = "<div style='background-color: white; border-color: rgba(127, 127, 127, 0.3); border-style: solid; border-width: 1; width: 500px;'>"
					html += "<div style='text-align: center;'><img style='height: 100px; width: 100px;' src='https://www.synchub.ca/images/logo.png'></div>"
					html += "<div style='font-weight: bold; padding: 10px 0; text-align: center;'>Hi, robogram</div>"
					html += "<div style='font-size: 15px; margin: 0 auto; padding: 10px 0; text-align: center; width: 300px;'>"
					html += "Thank you for choosing Synchub to help you manage your project(s). This is a reminder that "

					if day_diff > 0:
						if previous_trial == False:
							html += "you are " + str(day_diff) + " day(s) away from the end of your monthly payment. "
						else:
							html += "you are " + str(day_diff) + " day(s) away from the end of your trial. "
					else:
						html += "This is your last day before your payment is overdue. "

					html += "<strong style='color: red;'>Warning: You will not be able to commit and pull file(s)/folder(s) after the end of your trial or monthly payment</strong>"
					html += "</div>"
					html += "<div style='background-color: black; border-radius: 10; color: white; font-weight: bold; margin: 20px auto; padding: 5px 10px; text-align: center; width: 150px;'><a style='color: white; padding: 5px 32px; text-decoration: none;' href='https://www.synchub.ca/payment/" + userid + "'>Pay $1.99"

					if day_diff > 0:
						if previous_trial == False:
							message = "Monthly Payment Due in " + str(day_diff) + " day(s)"
						else:
							message = "Trial Over in " + str(day_diff) + " day(s)"
					else:
						message = "Last day before overdue"

					html += "</a></div>"
					html += "</div>"

					msg = Message(message, sender="admin@geottuse.com", recipients=[user.email])
					msg.html = html

					mail.send(msg)

					monthlypay[len(monthlypay) - 1]['day_sent'].append(day_diff)
					user.monthlypay = json.dumps(monthlypay)
					db.session.commit()
			elif day_diff == 100 or day_diff == 200:
				if day_diff not in previous_day_sent:
					html = "<div style='background-color: white; border-color: rgba(127, 127, 127, 0.3); border-style: solid; border-width: 1; width: 500px;'>"
					html += "<div style='text-align: center;'><img style='height: 100px; width: 100px;' src='https://www.synchub.ca/images/logo.png'></div>"
					html += "<div style='font-weight: bold; padding: 10px 0; text-align: center;'>Hi, robogram</div>"
					html += "<div style='font-size: 15px; margin: 0 auto; padding: 10px 0; text-align: center; width: 300px;'>"
					html += "Thank you for choosing Synchub to help you manage your project(s). <strong style='color: red;'>Your payment is overdue. In order to continue committing and pulling file(s)/folder(s), you need to make your payment</strong>"
					html += "</div>"
					html += "<div style='background-color: black; border-radius: 10; color: white; font-weight: bold; margin: 20px auto; padding: 5px 10px; text-align: center; width: 150px;'><a style='color: white; padding: 5px 32px; text-decoration: none;' href='https://www.synchub.ca/payment/" + userid + "'>Pay $1.99"
					html += "</a></div>"
					html += "</div>"

					msg = Message("Your payment is overdue", sender="admin@geottuse.com", recipients=[user.email])
					msg.html = html

					mail.send(msg)

		if user.verified == False:
			html = "<div style='background-color: white; border-color: rgba(127, 127, 127, 0.3); border-style: solid; border-width: 1; width: 500px;'>"
			html += "<div style='text-align: center;'><img style='height: 100px; width: 100px;' src='https://www.synchub.ca/images/logo.png'></div>"
			html += "<div style='font-size: 20; font-weight: bold; padding: 10px 0; text-align: center;'>Verify your account</div>"
			html += "<div style='font-weight: bold; padding: 10px 0; text-align: center;'>Hi, robogram</div>"
			html += "<div style='margin: 0 auto; padding: 10px 0; text-align: center; width: 300px;'>"
			html += "Thank you for choosing Synchub to help you manage your project(s). "
			html += "Please click below to verify your e-mail"
			html += "</div>"
			html += "<div style='background-color: black; border-radius: 10; color: white; font-weight: bold; margin: 20px auto; padding: 5px 10px; text-align: center; width: 150px;'><a style='color: white; padding: 5px 32px; text-decoration: none;' href='https://www.synchub.ca/user/verify_account/" + userid + "'>Verify</a></div>"
			html += "</div>"

			msg = Message("Synchub E-mail Verification", sender="admin@geottuse.com", recipients=[user.email])
			msg.html = html

			mail.send(msg)

		repos_size = get_size(previous_trial, user.username)

		return jsonify({ 'error': False, 'username': user.username, 'committed_files': committed_files, 'verified': user.verified, 'repos_size': repos_size, 'day_diff': day_diff })

	return jsonify({ 'error': True })

@app.route("/user/get_committed_path", methods=['POST'])
def get_committed_path():
	userid = request.form['userid']
	file_name = request.form['file_name']
	paths = json.loads(request.form['paths'])

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		monthlypay = json.loads(user.monthlypay)

		info = is_overdue(user)

		previous_trial = info['trial']

		directory = users_dir + "/members/" + user.username + "/" + "/".join(paths)
		committed_files = []
		file_info = { 'name': "", 'lines': [], 'bytes': 0, 'image': "" }

		mimetype = mimetypes.guess_type(directory + "/" + file_name)

		if mimetype[0] != None:
			file_info["name"] = file_name

			file_path = directory + "/" + file_name
			file_info["bytes"] = os.path.getsize(file_path)

			if mimetype[0].replace("image", "") != mimetype[0]:
				file_info["image"] = file_name

				image_size = Image.open(file_path)

				file_info["image_size"] = { "width": image_size.size[0], "height": image_size.size[1] }
			else:
				file_info["lines"] = open(file_path).readlines()

		files = os.listdir(directory)

		for file in files:
			is_dir = os.path.isdir(os.path.join(directory, file))

			if file != '.DS_Store':
				committed_files.append({ 'file_name': file, 'added': True, 'is_dir': is_dir, 'dir': directory.replace(users_dir + "/members/" + user.username, '') })

		repos_size = get_size(previous_trial, user.username)

		return jsonify({ 'error': False, 'committed_files': committed_files, 'file_info': file_info, 'repos_size': repos_size })

	return jsonify({ 'error': True })

@app.route("/user/read_image", methods=['POST'])
def read_image():
	userid = request.form['userid']
	image_path = request.form['image_path']

	user = User.query.filter_by(userid=userid).first()

	image_path = users_dir + "/members/" + user.username + "/" + image_path

	with open(image_path, "rb") as f:
		data = f.read()
		mimetype = mimetypes.MimeTypes().guess_type(image_path)[0]
		base64string = data.encode("base64")

		image_data = "data:" + mimetype + ";base64," + base64string

	return jsonify({ 'error': False, 'data_uri': image_data })

@app.route("/user/commit_file", methods=['POST'])
def commit_file():
	month_list = ["January","February","March","April","May","June","July","August","September","October","November","December"]

	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		info = is_overdue(user)

		previous_paid = info['paid']
		day_diff = info['diff']
		previous_day_sent = info['day_sent']
		previous_trial = info['trial']

		overdue = False

		if previous_paid == "0.00":
			if day_diff >= 0 and day_diff <= 5:
				if day_diff not in previous_day_sent:
					if previous_trial == False:
						monthly_neardue = True
					else:
						trial_neardue = True
			elif day_diff == 100:
				overdue = True

				if previous_trial == False:
					monthly_neardue = True

		if overdue == False:
			commit_file = request.files['commit_file']
			repos_sizes = json.loads(request.form['repos_sizes'])

			file_name = secure_filename(commit_file.filename)
			commit_file.save(file_name)

			monthlypay = json.loads(user.monthlypay)
			useractions = json.loads(user.useractions)
	
			paid = monthlypay[len(monthlypay) - 1]["paid"]
			trial = monthlypay[len(monthlypay) - 1]["trial"]
			commits = useractions["commits"]
			committed_records = []

			now = datetime.datetime.now()
			now_info = str(now).split()
			date = now_info[0]
			time = now_info[1]

			date_info = date.split('-')
			time_info = time.split(':')

			year = date_info[0]
			month = month_list[int(date_info[1]) - 1]
			date = str(date_info[2]).replace("0", "") if date_info[2] < 10 else date_info[2]
			day = now.strftime("%A")

			hour = time_info[0]
			minute = time_info[1]
			period = now.strftime("%p")

			date_string = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period

			directory = users_dir + "/members/" + user.username

			# unzip then remove zip
			file_name = file_name.replace(".zip", "")

			zip_ref = zipfile.ZipFile(file_name + ".zip", 'r')
			zip_ref.extractall(directory + "/" + file_name)
			zip_ref.close()
			os.remove(file_name + ".zip")

			gen_dir = directory + "/" + file_name
			real_dir = directory

			repos = os.listdir(directory)
			repos.pop(repos.index(file_name))

			num_repos = 0
			num_repos_detected = 0
			valid_commit = True

			for repos_info in repos_sizes:
				# get all repos and size
				if repos_info["repos_name"] in repos:
					committing_size = 0

					for f_path, dirs, files in os.walk(directory + "/" + repos_info["repos_name"]):
						for f in files:
							fp = os.path.join(f_path, f)
							committing_size += os.path.getsize(fp)

					repos_info["size"] = committing_size
					num_repos_detected += 1
				
				if repos_info["size"] > 0:
					num_repos += 1

			if trial == True:
				if num_repos > 1:
					valid_commit = False
			else:
				if len(repos) == 5:
					if len(repos_sizes) != num_repos_detected:
						valid_commit = False

			if valid_commit == True:
				with open(gen_dir + "/directories.txt") as file:
					paths = json.loads(file.read())

					for path in paths:
						gen_dir = directory + "/" + file_name
						real_dir = directory

						for dir in path["dir"]:
							real_dir += "/" + dir

							if os.path.exists(real_dir) == False:
								shutil.copytree(users_dir + "/members/user_folder", real_dir)

						if os.path.exists(real_dir + "/" + path["file_name"]):
							old_size = 0
							committing_size = 0

							if os.path.isdir(real_dir + "/" + path["file_name"]):
								for f_path, dirs, files in os.walk(real_dir + "/" + path["file_name"]):
									for f in files:
										fp = os.path.join(f_path, f)
										old_size += os.path.getsize(fp)

								for f_path, dirs, files in os.walk(gen_dir + "/" + path["rename_file"]):
									for f in files:
										fp = os.path.join(f_path, f)
										committing_size += os.path.getsize(fp)
							else:
								old_size = os.path.getsize(real_dir + "/" + path["file_name"])
								committing_size = os.path.getsize(gen_dir + "/" + path["rename_file"])

							if len(path["dir"]) > 0:
								for repos_info in repos_sizes:
									if repos_info["repos_name"] == path["dir"][0]:
										repos_size = (repos_info["size"] - old_size) + committing_size
							else:
								for repos_info in repos_sizes:
									if repos_info["repos_name"] == path["file_name"]:
										repos_size = (repos_info["size"] - old_size) + committing_size
										
							src = gen_dir + "/" + path["rename_file"]
							dest = real_dir + "/" + path["file_name"]

							if repos_size <= repos_size_limit:
								if os.path.isdir(real_dir + "/" + path["file_name"]):
									shutil.rmtree(real_dir + "/" + path["file_name"])

								os.rename(src, dest)

								is_dir = os.path.isdir(os.path.join(real_dir, path["file_name"]))

								committed_records.append({ "file_name": path["file_name"], "folder_path": "robogram" + "/".join(path["dir"]), "is_dir": is_dir })
							else:
								valid_commit = False
						else:
							committing_size = 0

							src = gen_dir + "/" + path["rename_file"]
							dest = real_dir + "/" + path["file_name"]

							if os.path.isdir(src):
								for f_path, dirs, files in os.walk(gen_dir + "/" + path["rename_file"]):
									for f in files:
										fp = os.path.join(f_path, f)
										committing_size += os.path.getsize(fp)
							else:
								committing_size = os.path.getsize(src)

							repos_size = 0

							for repos_info in repos_sizes:
								path_file_name = path["dir"][0] if len(path["dir"]) > 0 else path["file_name"]

								if repos_info["repos_name"] == path_file_name:
									repos_size = repos_info["size"] + committing_size

							if repos_size <= repos_size_limit:
								os.rename(src, dest)

								is_dir = os.path.isdir(os.path.join(real_dir, path["file_name"]))

								committed_records.append({ "file_name": path["file_name"], "folder_path": "robogram" + "/".join(path["dir"]), "is_dir": is_dir })
							else:
								valid_commit = False

				commits.append({ "date": date_string, "files": committed_records })
				useractions["commits"] = commits
				user.useractions = json.dumps(useractions)
				db.session.commit()

			shutil.rmtree(directory + "/" + file_name)

			if valid_commit == True:
				repos_size = get_size(trial, user.username)

				return jsonify({ 'error': False, 'repos_size': repos_size })
			else:
				if repos_size <= repos_size_limit:
					if trial == True:
						if num_repos > 1:
							return jsonify({ 'error': True, 'error_type': 'limit' })
					else:
						if len(repos) == 5:
							if len(repos_sizes) != num_repos_detected:
								return jsonify({ 'error': True, 'error_type': 'non_exist' })
				else:
					return jsonify({ 'error': True, 'error_type': 'overload' })
		
		return jsonify({ 'error': True, 'error_type': 'overdue' })

	return jsonify({ 'error': True })

@app.route("/user/delete_file", methods=['POST'])
def delete_file():
	month_list = ["January","February","March","April","May","June","July","August","September","October","November","December"]

	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		info = is_overdue(user)

		previous_paid = info['paid']
		day_diff = info['diff']
		previous_day_sent = info['day_sent']
		previous_trial = info['trial']

		overdue = False

		if previous_paid == "0.00":
			if day_diff >= 0 and day_diff <= 5:
				if day_diff not in previous_day_sent:
					if previous_trial == False:
						monthly_neardue = True
					else:
						trial_neardue = True
			elif day_diff == 100:
				overdue = True

				if previous_trial == False:
					monthly_neardue = True
		
		if overdue == False:
			path = request.form['path']
			delete_file = request.files['delete_file']
			now = datetime.datetime.now()
			committed_files = []
			is_file_exist = True

			file_name = secure_filename(delete_file.filename)
			directory = users_dir + "/members/" + user.username

			delete_file.save(os.path.join(directory, file_name))

			user.useractions = json.loads(user.useractions)
			repos = os.listdir(directory)

			deletes = user.useractions["deletes"]
			delete_records = []

			now_info = str(now).split()
			date = now_info[0]
			time = now_info[1]

			date_info = date.split('-')
			time_info = time.split(':')

			year = date_info[0]
			month = month_list[int(date_info[1]) - 1]
			date = str(date_info[2]).replace("0", "") if date_info[2] < 10 else date_info[2]
			day = now.strftime("%A")

			hour = time_info[0]
			minute = time_info[1]
			period = now.strftime("%p")

			date_string = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period

			directory = users_dir + "/members/" + user.username

			path = "/" + path if path != "" else ""

			with open(os.path.join(directory, file_name)) as file:
				files = json.loads(file.read())

				for file in files:
					if os.path.exists(os.path.join(directory + path, file["file_name"])):
						is_dir = os.path.isdir(os.path.join(directory + path, file["file_name"]))

						if is_dir:
							shutil.rmtree(os.path.join(directory + path, file["file_name"]))
						else:
							os.remove(os.path.join(directory + path, file["file_name"]))

						dir = directory + path
						delete_records.append({ "file_name": file["file_name"], "folder_path": dir.replace(users_dir + '/members/', ''), "is_dir": is_dir })
					else:
						is_file_exist = False

			if is_file_exist == True:
				os.remove(os.path.join(directory, file_name))

				files = os.listdir(directory + path)

				for file in files:
					if os.path.exists(os.path.join(directory + path, file)):
						is_dir = os.path.isdir(os.path.join(directory + path, file))

						if file != '.DS_Store':
							committed_files.append({ 'file_name': file, 'added': True, 'is_dir': is_dir, 'dir': path })

				deletes.append({ "date": date_string, "files": delete_records })
				user.useractions["deletes"] = deletes
				user.useractions = json.dumps(user.useractions)
				db.session.commit()

				repos_size = get_size(previous_trial, user.username)

				return jsonify({ 'error': False, 'committed_files': committed_files, 'repos_size': repos_size })

			return jsonify({ 'error': True, 'error_type': 'non_exist' })

		return jsonify({ 'error': True, 'error_type': 'overdue' })

	return jsonify({ 'error': True })

@app.route("/user/pull_files", methods=['POST'])
def pull_files():
	letter = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
		'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
	]
	month_list = ["January","February","March","April","May","June","July","August","September","October","November","December"]
	userid = request.form['userid']
	file_name = request.form['file_name']
	path = request.form['path']
	now = datetime.datetime.now()
	is_file_exist = True

	folder_name = ''
	folder_name_length = randint(8, 15)

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		info = is_overdue(user)

		previous_paid = info['paid']
		day_diff = info['diff']
		previous_day_sent = info['day_sent']
		previous_trial = info['trial']

		overdue = False

		if previous_paid == "0.00":
			if day_diff >= 0 and day_diff <= 5:
				if day_diff not in previous_day_sent:
					if previous_trial == False:
						monthly_neardue = True
					else:
						trial_neardue = True
			elif day_diff == 100:
				overdue = True

				if previous_trial == False:
					monthly_neardue = True
		
		if overdue == False:
			user.useractions = json.loads(user.useractions)

			pulls = user.useractions["pulls"]
			pulled_records = []

			now_info = str(now).split()
			date = now_info[0]
			time = now_info[1]

			date_info = date.split('-')
			time_info = time.split(':')

			year = date_info[0]
			month = month_list[int(date_info[1]) - 1]
			date = str(date_info[2]).replace("0", "") if date_info[2] < 10 else date_info[2]
			day = now.strftime("%A")

			hour = time_info[0]
			minute = time_info[1]
			period = now.strftime("%p")

			date_string = day + ", " + month + " " + date + ", " + year + " at " + hour + ":" + minute + " " + period

			directory = users_dir + "/members/" + user.username

			for k in range(folder_name_length):
				ran_num = randint(0, 9)
				ran_letter = letter[randint(0, 25)]
				folder_name += ran_letter if randint(0, 9) / 2 == 0 else str(ran_num)

			shutil.copytree(users_dir + "/members/user_folder", directory + "/" + folder_name)

			if file_name == 'all':
				files = os.listdir(directory + path)
				files.pop(files.index(folder_name))

				for file in files:
					if os.path.exists(directory + path + "/" + file):
						is_dir = os.path.isdir(directory + path + "/" + file)

						if is_dir:
							shutil.copytree(os.path.join(directory + path, file), os.path.join(directory + "/" + folder_name, file))
						else:
							shutil.copyfile(os.path.join(directory + path, file), os.path.join(directory + "/" + folder_name, file))

						dir = directory + path
						pulled_records.append({ "file_name": file, "folder_path": dir.replace(users_dir + '/members/', ''), "is_dir": is_dir })
					else:
						is_file_exist = False
			else:
				if os.path.exists(os.path.join(directory + path, file_name)):
					is_dir = os.path.isdir(os.path.join(directory + path, file_name))

					if is_dir:
						shutil.copytree(os.path.join(directory + path, file_name), os.path.join(directory + "/" + folder_name, file_name))
					else:
						shutil.copyfile(os.path.join(directory + path, file_name), os.path.join(directory + "/" + folder_name, file_name))

					dir = directory + "/" + folder_name
					pulled_records.append({ "file_name": file_name, "folder_path": dir.replace(users_dir + '/members/', ''), "is_dir": is_dir })
				else:
					is_file_exist = False

			if is_file_exist:
				shutil.make_archive(directory + "/" + folder_name, "zip", directory + "/" + folder_name)
				shutil.rmtree(directory + "/" + folder_name)
				
				with open(directory + "/" + folder_name + ".zip", "rb") as file:
					data = file.read()
					image_data = base64.encodestring(data)

				os.remove(directory + "/" + folder_name + ".zip")

				pulls.append({ "date": date_string, "files": pulled_records })
				user.useractions["pulls"] = pulls
				user.useractions = json.dumps(user.useractions)
				db.session.commit()

				return jsonify({ 'error': False, 'image_data': image_data, 'zip_name': folder_name, 'is_file_exist': is_file_exist })
			else:
				shutil.rmtree(directory + "/" + folder_name)

				return jsonify({ 'error': True, 'error_type': 'non_exist' })
		
		return jsonify({ 'error': True, 'error_type': 'overdue' })

	return jsonify({ 'error': True })

@app.route("/user/reclone_repos", methods=['POST'])
def reclone_repos():
	letter = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
		'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
	]

	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		info = is_overdue(user)

		previous_paid = info['paid']
		day_diff = info['diff']
		previous_day_sent = info['day_sent']
		previous_trial = info['trial']

		overdue = False

		if previous_paid == "0.00":
			if day_diff == 100:
				overdue = True

		if overdue == False:
			directory = users_dir + "/members/" + user.username
			synced_dir = os.listdir(directory)
			committed_dir = os.listdir(directory)
			local_files = []
			committed_files = []

			shutil.make_archive(directory, "zip", directory)

			with open(directory + ".zip", "rb") as file:
				data = file.read()
				image_data = base64.encodestring(data)

			os.remove(users_dir + "/members/" + user.username + ".zip")

			for file in synced_dir:
				file_ext = file.split(".")

				if len(file_ext) > 1:
					file_ext = "." + file_ext[len(file_ext) - 1]
				else:
					file_ext = ""

				rename_file = ""
				rename_name_length = randint(10, 20)

				for k in range(rename_name_length):
					ran_num = randint(0, 9)
					ran_letter = letter[randint(0, 25)]
					rename_file += ran_letter if randint(0, 9) / 2 == 0 else str(ran_num)

				rename_file += file_ext
				is_dir = os.path.isdir(users_dir + "/members/" + user.username + "/" + file)
				local_files.append({ 'file_name': file, 'added': False, 'is_dir': is_dir, 'dir': "", 'rename_file': rename_file })

			for file in committed_dir:
				is_dir = os.path.isdir(users_dir + "/members/" + user.username + "/" + file)

				committed_files.append({ 'file_name': file, 'added': True, 'is_dir': is_dir, 'dir': "" })

			return jsonify({ 'error': False, 'image_data': image_data, 'local_files': local_files, 'committed_files': committed_files })

		return jsonify({ 'error': True, 'error_type': 'overdue' })

	return jsonify({ 'error': True })

# web routes
@app.route("/user/register", methods=['POST'])
def register():
	letter = [
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
		'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
	]
	username = request.form['username']
	email = request.form['email']
	password = request.form['password']
	confirmpassword = request.form['confirmpassword']
	userid = ''
	userid_length = randint(8, 15)

	if len(username) < 6 or len(username) > 15:
		return jsonify({ 'error': True, 'error_message': 'Username has to be in a range of 6 - 15 characters' })

	if len(email) > 50:
		return jsonify({ 'error': True, 'error_message': 'E-mail cannot have more than 50 characters' })
	elif len(email) == 0:
		return jsonify({ 'error': True, 'error_message': 'Please enter an e-mail address' })

	if len(password) < 5:
		return jsonify({ 'error': True, 'error_message': 'Password has to be at least 5 characters long' })

	if len(confirmpassword) == 0:
		return jsonify({ 'error': True, 'error_message': 'Please confirm your password' })
	elif password != confirmpassword:
		return jsonify({ 'error': True, 'error_message': 'Password is mismatch' })

	for k in range(userid_length):
		ran_num = randint(0, 9)
		ran_letter = letter[randint(0, 25)]
		userid += ran_letter if randint(0, 9) / 2 == 0 else str(ran_num)

	hashed_password = generate_password_hash(password)
	user_actions = '{"commits":[],"pulls":[],"deletes":[]}'
	trial = str(datetime.datetime.now())
	trial = trial.split()[0]
	trial = json.dumps([{"date":trial, "trial":True, "paid":"0.00", "day_sent":[]}])
	
	credit_card = '{"name":"","number":"","exp_month":"","exp_year":"",'
	credit_card += '"cvc":"","address_line1":"","address_line2":"","address_city":"",'
	credit_card += '"address_state":"","address_zip":"","address_country":""}'

	user = User(userid, username, email, hashed_password, '[]', True, user_actions, trial, False, credit_card)
	db.session.add(user)
	db.session.commit()

	return jsonify({ 'error': False, 'userid': userid })

@app.route("/user/verify_account/<userid>", methods=['GET'])
def verify_account(userid):
	user = User.query.filter_by(userid=userid).first()

	if user != None:
		user.verified = True
		db.session.commit()

		return redirect("https://www.synchub.ca/verified/" + userid)
	else:
		return jsonify({ 'error': True })

@app.route("/user/create_repos", methods=['POST'])
def create_repos():
	userid = request.form['userid']
	repos_name = request.form['repos-name']
	error_message = ''

	if repos_name == '':
		return jsonify({ 'error': True, 'error_message': 'Please enter a name for your repository' })
	elif len(repos_name) > 20:
		return jsonify({ 'error': True, 'error_message': 'Your repository name cannot exceed 20 characters' })

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		return jsonify({ 'error': False })

	return jsonify({ 'error': True })

@app.route("/user/get_user_info", methods=['POST'])
def get_user_info():
	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		directory = users_dir + "/members/" + user.username

		repositories = json.loads(user.repositories)

		first_repos = repositories[0]["name"]

		if os.path.exists(os.path.join(users_dir + "/members/user_folder", directory)) == False:
			shutil.copytree(users_dir + "/members/user_folder", directory)
			shutil.copytree(users_dir + "/members/user_folder", directory + "/" + first_repos)
			shutil.make_archive(user.username, "zip", directory)
			
			with open(user.username + ".zip", "rb") as file:
				data = file.read()
				image_data = base64.encodestring(data)

			os.remove(user.username + ".zip")

			user.firsttime = False
			db.session.commit()

		return jsonify({ 'error': False, 'username': user.username, 'image_data': image_data })

	return jsonify({ 'error': True })

@app.route("/user/get_userid", methods=['POST'])
def get_userid():
	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		return jsonify({ 'error': False, 'username': user.username })

	return jsonify({ 'error': True })

@app.route("/user/login", methods=['POST'])
def login():
	username = request.form['username']
	password = request.form['password']

	user = User.query.filter_by(username=username).first()

	if user != None:
		user.repositories = json.loads(user.repositories)

		num_repos = len(user.repositories)

		if password == '':
			return jsonify({ 'error': True, 'error_message': 'Password is empty' })

		password = check_password_hash(user.password, password)

		if not password:
			return jsonify({ 'error': True, 'error_message': 'Password is incorrect' })

		return jsonify({ 'error': False, 'userid': user.userid, 'repos_name': username, 'num_repos': num_repos })

	return jsonify({ 'error': True, 'error_message': "Username doesn't exist" })

@app.route("/user/recover_password", methods=['POST'])
def recover_password():
	email = request.form['email']

	if email == "":
		return jsonify({ 'error': True, 'error_message': "E-mail is blank" })

	user = User.query.filter_by(email=email).first()

	if user != None:
		html = "<div style='background-color: white; border-color: rgba(127, 127, 127, 0.3); border-style: solid; border-width: 1; width: 500px;'>"
		html += "<div style='text-align: center;'><img style='height: 100px; width: 100px;' src='https://www.synchub.ca/images/logo.png'></div>"
		html += "<div style='font-size: 20; font-weight: bold; padding: 10px 0; text-align: center;'>Recover your password</div>"
		html += "<div style='font-weight: bold; padding: 10px 0; text-align: center;'>Hi, robogram</div>"
		html += "<div style='margin: 0 auto; padding: 10px 0; text-align: center; width: 300px;'>"
		html += "Thank you for choosing Synchub to help you manage your project(s). "
		html += "Please click below to reset your password"
		html += "</div>"
		html += "<div style='background-color: black; border-radius: 10; color: white; font-weight: bold; margin: 20px auto; padding: 5px 10px; text-align: center; width: 150px;'><a style='color: white; padding: 5px 32px; text-decoration: none;' href='https://www.synchub.ca/reset_password/" + user.userid + "'>Reset</a></div>"
		html += "</div>"

		msg = Message("Synchub Password Recovery", sender="admin@geottuse.com", recipients=[email])
		msg.html = html

		mail.send(msg)

		return jsonify({ 'error': False })

	return jsonify({ 'error': True, 'error_message': "E-mail doesn't exist" })

@app.route("/user/reset_password", methods=['POST'])
def reset_password():
	userid = request.form['userid']
	newpassword = request.form['newpassword']
	confirmnewpassword = request.form['confirmnewpassword']

	if len(newpassword) < 5:
		return jsonify({ 'error': True, 'error_message': 'Password has to be at least 5 characters long' })

	if len(confirmnewpassword) == 0:
		return jsonify({ 'error': True, 'error_message': 'Please confirm your password' })
	elif newpassword != confirmnewpassword:
		return jsonify({ 'error': True, 'error_message': 'Password is mismatch' })

	hashed_password = generate_password_hash(newpassword)

	user = User.query.filter_by(userid=userid).first()
	user.password = hashed_password
	db.session.commit()

	return jsonify({ 'error': False })

@app.route("/user/get_user_actions", methods=['POST'])
def get_user_actions():
	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	if user != None:
		user_actions = json.loads(user.useractions)

		return jsonify({ 'error': False, 'user_actions': user_actions })

	return jsonify({ 'error': True })

@app.route("/user/get_card_info", methods=['POST'])
def get_card_info():
	userid = request.form['userid']

	user = User.query.filter_by(userid=userid).first()

	creditcard = json.loads(user.creditcard)
	enable_pay_button = False

	info = is_overdue(user)

	previous_paid = info['paid']
	day_diff = info['diff']

	if previous_paid == "0.00":
		if day_diff >= 0 and day_diff <= 5:
			enable_pay_button = True
		elif day_diff == 100 or day_diff == 200:
			enable_pay_button = True

	return jsonify({ 'error': False, 'credit_card': creditcard, 'enable_pay_button': enable_pay_button })

@app.route("/user/save_credit_info", methods=['POST'])
def save_credit_info():
	userid = request.form['userid']
	credit_card = request.form['credit_card']

	user = User.query.filter_by(userid=userid).first()
	user.creditcard = credit_card
	db.session.commit()

	return jsonify({ 'error': False })

@app.route("/user/charge_user", methods=['POST'])
def charge_user():
	userid = request.form['userid']
	credit_info = json.loads(request.form['credit_info'])
	token = request.form['token']
	card_labels = [
		{'label': 'name', 'msg': 'Name is required'}, {'label': 'number', 'msg': 'Card number is required'},
		{'label': 'exp_month', 'msg': 'Expiry month is required'}, {'label': 'exp_year', 'msg': 'Expiry year is required'},
		{'label': 'cvc', 'msg': 'Security code is required'}, {'label': 'address_line1', 'msg': 'Address #1 is required'},
		{'label': 'address_city', 'msg': 'City is required'}, {'label': 'address_state', 'msg': 'State is required'},
		{'label': 'address_zip', 'msg': 'Postal code is required'}, {'label': 'address_country', 'msg': 'Country is required'}
	]

	for label in card_labels:
		if credit_info[label["label"]] == '':
			return jsonify({ 'error': True, 'error_message': label["msg"] })

	if token == '':
		return jsonify({ 'error': True, 'error_message': 'One or more information is invalid' })

	user = User.query.filter_by(userid=userid).first()
	monthlypay = json.loads(user.monthlypay)

	current_trial = monthlypay[len(monthlypay) - 1]
	current_trial["paid"] = "2.29"

	if current_trial["trial"]:
		description = 'First monthly payment'
	else:
		description = 'Monthly payment'

	monthlypay[len(monthlypay) - 1] = current_trial

	current_date = str(current_trial["date"].split()[0]).split('-')
	current_time = str(datetime.datetime.now()).split()[0].split('-')

	current_year = int(current_time[0])
	current_month = int(current_time[1])
	current_day = int(current_date[2])

	current_date[0] = str(current_year)
	current_date[1] = str(current_month)

	current_date = '-'.join(current_date)

	monthlypay.append({"date":current_date, "trial":False, "paid":"0.00", "day_sent":[]})

	user.monthlypay = json.dumps(monthlypay)
	db.session.commit()

	customer = stripe.Customer.create(email=user.email, source=token)
	stripe.Charge.create(customer=customer.id, amount=229, currency='cad', description=description)
	
	return jsonify({ 'error': False })

@app.route("/user/send_email", methods=['POST'])
def send_email():
	html = ""

	msg = Message("Synchub E-mail Verification", sender="admin@geottuse.com", recipients=["kevin.mai_730@hotmail.com"])
	msg.html = html

	mail.send(msg)

	return jsonify({ 'error': False })

if __name__ == "__main__":
    app.run(host='0.0.0.0')
