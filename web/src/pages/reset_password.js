import React, { Component } from 'react'
import 'normalize.css'
import './reset_password.css'
import link from '../link'

class reset_password extends Component {
    constructor(props) {
        super(props)

        var { params } = props.match;
        var { userid } = params;

        this.state = {
            userid: userid,
            newpassword: "",
            confirmnewpassword: "",
            error_msg: "",

            password_changed: false,
            seconds: 0
        }
    }
    reset = () => {
        var form_data = new FormData()
        var { userid, newpassword, confirmnewpassword } = this.state

        form_data.append("userid", userid)
        form_data.append("newpassword", newpassword)
        form_data.append("confirmnewpassword", confirmnewpassword)

        fetch(link + 'reset_password', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var error_msg

            if (!error) {
                localStorage.setItem("userid", userid)

                this.setState({ 'password_changed': true, 'seconds': 3 })
                setInterval(this.redirect, 1000)
            } else {
                error_msg = response.error_message

                this.setState({ 'error_msg': error_msg })
            }
        })
    }
    redirect = () => {
        var { userid, seconds } = this.state

        seconds--

        this.setState({ 'seconds': seconds })

        if (seconds === 0) {
            localStorage.setItem("userid", userid)
            window.location = '/main'
        }
    }
    render() {
        var { userid, password_changed, seconds } = this.state
        
        return (
            <div className="reset_password">
                <div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                    { localStorage.getItem("userid") != null ? 
                        <div className="index-signout" onClick={() => {
                            localStorage.clear()

                            window.location = '/login'
                        }}>Sign-Out</div>
                    : null }
                </div>
                {localStorage.getItem("userid") != null ? 
                    <div className="nav_bars-in">
                        <div className="nav_bar" onClick={() => { window.location = '/main' }}>Repository(s)</div>
                        <div className="nav_bar" onClick={() => { window.location = '/price_layout' }}>Pricing</div>
                        <div className="nav_bar" onClick={() => { window.location = '/payment/' + userid }}>Billing</div>
                        <div className="nav_bar" onClick={() => { window.location = '/recover_password' }}>Recover Password</div>
                        <div className="nav_bar" onClick={() => { window.location = '/terms' }}>Terms</div>
                        <div className="nav_bar" onClick={() => { window.location = '/privacy' }}>Privacy</div>
                        <div className="nav_bar"><a href="mailto:admin@geottuse.com?Subject=Report%20a%20bug%20or%20ask%20a%20question">Contact</a></div>
                    </div>
                    :
                    <div className="nav_bars">
                        <div className="nav_bar" onClick={() => { window.location = '/home' }}>Home</div>
                        <div className="nav_bar" onClick={() => { window.location = '/price_layout' }}>Pricing</div>
                        <div className="nav_bar" onClick={() => { window.location = '/register' }}>Register</div>
                        <div className="nav_bar" onClick={() => { window.location = '/login' }}>Sign-In</div>
                        <div className="nav_bar" onClick={() => { window.location = '/recover_password' }}>Recover Password</div>
                        <div className="nav_bar" onClick={() => { window.location = '/terms' }}>Terms</div>
                        <div className="nav_bar" onClick={() => { window.location = '/privacy' }}>Privacy</div>
                        <div className="nav_bar"><a href="mailto:admin@geottuse.com?Subject=Report%20a%20bug%20or%20ask%20a%20question">Contact</a></div>
                    </div>
                }
                <div className="reset_password-form_box">
                    <div className="reset_password-form">
                        <div className="form-header">Reset Password</div>

                        <div className="form-item">
                            <div>New Password:</div>
                            <input type="password" onChange={(newpassword) => this.setState({ newpassword: newpassword.target.value })}/>
                        </div>

                        <div className="form-item">
                            <div>Confirm New Password:</div>
                            <input type="password" onChange={(confirmnewpassword) => this.setState({ confirmnewpassword: confirmnewpassword.target.value })}/>
                        </div>
                        <div className="form-error">{ this.state.error_msg }</div>

                        <div className="form-item">
                            <div className="reset_password-submit" onClick={this.reset}>Reset</div>
                        </div>
                    </div>
                </div>

                { password_changed ? 
                    <div className="hidden-box">
                        <div className="reset_complete-box">
                            <div className="reset_complete-header">Password changed complete</div>
                            <div className="reset_complete-redirect">Redirecting to repository in {seconds}</div>
                        </div>
                    </div>
                : null }
            </div>
        );
    }
}

export default reset_password;
