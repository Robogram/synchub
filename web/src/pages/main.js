import React, { Component } from 'react'
import './main.css'
import link from '../link'

import platform from 'platform'

class main extends Component {
    constructor(props) {
        super(props)

        if (localStorage.getItem("userid") === null) {
            localStorage.clear()

            window.location = "/login"
        }

        this.state = {
            userid: localStorage.getItem("userid"),
            username: "",
            committed_files: [],
            committed_dir_index: 1,
            committed_folder_path: [],
            paths: [],
            file_info: {
                name: "",
                lines: [],
                bytes: 0,
                image: "",
                image_size: { "width": 0, "height": 0 }
            },
            image_view: "",
            user_actions: {"show_actions": false, "records": {"adds":[], "commits":[], "pulls":[], "deletions":[]}},
            verified: true,
            repos_size: 0
        }

        this.get_files()
    }
    logout() {
        localStorage.clear()

        window.location = "/login"
    }
    get_files() {
        var form_data = new FormData()
        var userid = this.state.userid

        form_data.append('userid', userid)

        fetch(link + 'get_committed_files', { 
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var committed_files, username, verified, repos_size

            if (!error) {
                committed_files = response.committed_files
                username = response.username
                verified = response.verified
                repos_size = response.repos_size
            }
                
            this.setState({ 'username': username, 'committed_files': committed_files, 'verified': verified, 'repos_size': repos_size })
        })
        .catch((error) => {

        })
    }
    get_file_info(index, file_name, is_dir) {
        var { userid, username, committed_files, committed_dir_index, committed_folder_path, paths, user_actions } = this.state;
        var form_data = new FormData()
        var folder_length = committed_folder_path.length
        var old_path = [], new_path = false

        if (is_dir) {
            committed_folder_path.forEach(function (info) {
                paths.push(info.folder_name)
            })

            committed_folder_path.forEach(function (info) {
                if (info.folder_name === file_name) {
                    if (info.index !== index) {
                        new_path = true
                    }
                }
            })

            if (paths.indexOf(file_name) === -1 || new_path) {
                if (file_name !== username) {
                    if ((parseInt(index) - 1) === folder_length) {
                        old_path = committed_folder_path
                        old_path.push({ index: index, folder_name: file_name })
                        committed_folder_path = old_path
                    } else {
                        committed_folder_path.forEach(function (info) {
                            if (info.index < index) {
                                old_path.push(info)
                            }
                        })

                        old_path.push({ index: old_path.length + 1, folder_name: file_name })
                        committed_folder_path = old_path
                    }
                }

                paths = []
                old_path.forEach(function (info) {
                    paths.push(info.folder_name)
                })
            } else {
                if (file_name !== username) {
                    paths = []
                    committed_folder_path.forEach(function (info) {
                        if (info.index <= index) {
                            paths.push(info.folder_name)
                        }
                    })
                }
            }

            committed_dir_index = parseInt(index) + 1
            committed_files = []
        } else {
            paths = []
            committed_folder_path.forEach(function (info) {
                if (info.index < committed_dir_index) {
                    paths.push(info.folder_name)
                }
            })
        }

        form_data.append('userid', userid)
        form_data.append('file_name', file_name)
        form_data.append('paths', JSON.stringify(paths))

        fetch(link + 'get_committed_path', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var file_info

            if (!error) {
                file_info = response.file_info
                committed_files = response.committed_files
                user_actions.show_actions = false

                this.setState({ 
                    'committed_files': committed_files, 
                    'committed_dir_index': committed_dir_index, 
                    'committed_folder_path': committed_folder_path, 
                    'paths': paths, 
                    'file_info': file_info,
                    'user_actions': user_actions
                })

                if (file_info.image !== "") {
                    this.read_image(file_info.image)
                }
            }
        })
    }
    read_image(img) {
        var form_data = new FormData()
        var { userid, paths } = this.state
        var image_path =  paths.join('/') + '/' + img

        form_data.append('userid', userid)
        form_data.append('image_path', image_path)

        fetch(link + 'read_image', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error

            if (!error) {
                this.setState({ 'image_view': response.data_uri })
            }
        })
    }
    get_user_actions = () => {
        var form_data = new FormData()
        var userid = this.state.userid

        form_data.append('userid', userid)

        fetch(link + 'get_user_actions', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var user_actions

            if (!error) {
                user_actions = response.user_actions

                user_actions.show_actions = true
                user_actions.records = user_actions

                this.setState({ 'user_actions': user_actions })
            }
        })
    }
    displayImage() {
        var { file_info, image_view } = this.state
        var { width, height } = file_info.image_size
        var screen_width = (window.innerWidth - 271), screen_height = (window.innerHeight - 139)
        var image_width, image_height, margin_left, margin_top

        if (width === height) {
            image_width = screen_width / 2
            image_height = screen_width / 2
        } else if ((width - height) > 0) {
            image_width = screen_width / 2
            image_height = (height * image_width) / width
        } else if ((width - height) < 0) {
            image_height = screen_height / 2
            image_width = (width * image_height) / height
        }

        margin_left = (screen_width - image_width) / 2
        margin_top = (screen_height - image_height) / 2

        return <img alt="" src={image_view} style={{ height: image_height, marginLeft: margin_left, marginTop: margin_top, width: image_width }}/>
    }
    openSetting() {
        var settings = document.getElementsByClassName("settings")[0].style
        var settings_box = document.getElementsByClassName("settings-box")[0].style
        var settings_background = document.getElementsByClassName("settings-background")[0].style

        settings.display = 'block'

        settings_box.opacity = 1
        settings_box.marginLeft = "0px"
        settings_box.transition = "margin-left 0.5s, opacity 0.5s"

        settings_background.opacity = 1
        settings_background.transition = "opacity 0.5s"
    }
    closeSetting() {
        var settings = document.getElementsByClassName("settings")[0].style
        var settings_box = document.getElementsByClassName("settings-box")[0].style
        var settings_background = document.getElementsByClassName("settings-background")[0].style

        settings_box.opacity = 0
        settings_box.marginLeft = "-300px"
        settings_box.transition = "margin-left 0.5s, opacity 0.5s"

        settings_background.opacity = 0
        settings_background.transition = "opacity 0.5s"

        setTimeout(function () {
            settings.display = 'none'
        }, 1000)
    }
    render() {
        var { userid, username, committed_files, committed_dir_index, committed_folder_path, file_info, user_actions, verified, repos_size } = this.state;
        var user_actions_list = [{'header':'Commit(s)','name':'commits'}, {'header':'Pull(s)','name':'pulls'}, {'header':'Delete(s)','name':'deletes'}]
        var { bytes, image, lines, name, image_size } = file_info
        var operating_sys = String(platform.os)

        return (
            <div className="main">
                <div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                </div>
                <div className="setting_bar" onClick={this.openSetting}>
                    <div className="setting-bar"></div>
                    <div className="setting-bar"></div>
                    <div className="setting-bar"></div>
                </div>
                <div className="main-body">
                    <div className="row-one"> 
                        <div className="user_info-username">You are logged in as { username }</div>

                        <div className="file_list-box">
                            {committed_files.map(({ file_name, is_dir }) => (
                                <div className="file" onClick={() => this.get_file_info(committed_dir_index, file_name, is_dir)}>{file_name}</div>
                            ))}
                        </div>

                        <div className="download_button">
                            { 
                                operating_sys.replace("OS X", "") !== operating_sys ||
                                operating_sys.replace("Windows", "") !== operating_sys ? 
                                    operating_sys.replace("OS X", "") !== operating_sys ? 
                                        <a href="https://www.synchub.ca/Synchub-mac.zip">Download Software</a>
                                    :
                                        <a href="https://www.synchub.ca/Synchub-win.zip">Download Software</a>
                                :
                                'Unavailable'
                            }
                        </div>
                        <div className="all_actions_button" onClick={this.get_user_actions}>View All Your Action(s)</div>
                    </div>
                    <div className="info-box">
                        {!user_actions.show_actions ? 
                            <div>
                                <div className="used-bytes">{repos_size}</div>
                                <div className="file_directory">Directory: 
                                    <strong className="path" onClick={() => this.get_file_info(0, username, true)}> {username} / </strong>

                                    {committed_folder_path.map((info, index) => (
                                        <strong className="path" onClick={() => this.get_file_info(info.index, info.folder_name, true)}> {info.folder_name} / </strong>
                                    ))}
                                </div>
                                {lines.length > 0 || image !== '' ? 
                                    <div className="file_info">
                                        <div className="file_data">
                                            <div className="info-name">File: <strong>{name}</strong></div>
                                            <div className="info-bytes">Size: <strong>{bytes} bytes</strong></div>
                                            { image !== '' ? <div className="info-size">Width: <strong>{image_size.width}px</strong>, Height: <strong>{image_size.height}px</strong></div> : null }
                                            { lines.length > 0 ? <div className="info-lines">Lines: <strong>{lines.length}</strong></div> : null }
                                        </div>
                                        {image !== '' ? 
                                            <div className="image-holder">
                                                {this.displayImage()}
                                            </div>
                                        :
                                            <div className="file_sourcecode">
                                                <pre className="prettyprint">
                                                    {lines.map((line, index) => (
                                                        <div>{(index + 1) + ". " + line}</div>
                                                    ))}
                                                </pre>
                                            </div>
                                        }
                                    </div>
                                    :
                                    <div className="file_text-header">Select a file to view it's source code</div>
                                }
                            </div>
                            :
                            <div className="user_action_box">
                                {user_actions_list.map(user_action => (
                                    <div className="user_action">
                                        <div className="user_action-header">{user_action.header}</div>
                                        <div className="user_action-list">
                                            {user_actions.records[user_action.name].map(item => (
                                                <div className="user_action_record">
                                                    <div className="user_action_record-date">{item.date}</div>
                                                    <div className="user_action_record-files-list">
                                                        {item.files.map(file_info => (
                                                            <div className="action_file">
                                                                <div className="action_file-header">{file_info.file_name}</div>
                                                                <div className="action_file-directory">{file_info.folder_path}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        } 
                    </div>
                </div>

                { !verified ? <div className="unverified-header">Please check your e-mail to verify your account</div> : null }

                <div className="settings">
                    <div className="settings-box">
                        <div className="settings_close" onClick={this.closeSetting}>
                            <div className="settings-close-left"></div>
                            <div className="settings-close-right"></div>
                        </div>
                        <div className="setting-navbar" onClick={this.logout}>Sign-Out</div>
                        <div className="setting-navbar" onClick={() => { window.location = '/main' }}>Repository(s)</div>
                        <div className="setting-navbar" onClick={() => { window.location = '/price_layout' }}>Pricing</div>
                        <div className="setting-navbar" onClick={() => { window.location = '/payment/' + userid }}>Billing</div>
                        <div className="setting-navbar" onClick={() => { window.location = '/recover_password' }}>Recover Password</div>
                        <div className="setting-navbar" onClick={() => { window.location = '/terms' }}>Terms</div>
                        <div className="setting-navbar" onClick={() => { window.location = '/privacy' }}>Privacy</div>
                        <div className="setting-navbar"><a href="mailto:admin@geottuse.com?Subject=Report%20a%20bug%20or%20ask%20a%20question">Contact</a></div>
                    </div>

                    <div className="settings-background" onClick={this.closeSetting}></div>
                </div>
            </div>
        )
    }
}

export default main;
