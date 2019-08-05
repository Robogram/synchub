import React, { Component } from 'react'
import 'normalize.css'
import './login.css'
import link from '../link'

class login extends Component {
    constructor(props) {
        super(props)

        if (localStorage.getItem("userid") !== null) {
            window.location = "/main"
        }

        this.state = {
            username: "",
            password: "",
            error_msg: ""
        }
    }
    login = () => {
        var form_data = new FormData()
        var { username, password } = this.state

        form_data.append('username', username)
        form_data.append('password', password)

        fetch(link + 'login', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var userid, repos_name, error_msg

            if (!error) {
                userid = response.userid
                repos_name = response.repos_name

                localStorage.setItem("userid", userid)
                localStorage.setItem("repos_name", repos_name)

                if (localStorage.getItem("pay_time") !== null) {
                    window.location = '/payment/' + userid
                } else {
                    window.location = '/main'
                }
            } else {
                error_msg = response.error_message

                this.setState({ 'error_msg': error_msg })
            }
        })
    }
    render() {
        return (
            <div className="login">
                <div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                </div>
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
                <div className="info">Manage your repositories synchronously using an API. No more (CLI) Command-Line-Interface</div>
                <div className="login-form_box">
                    <div className="login-form">
                        <div className="form-header">Log-In</div>

                        <div className="form-item">
                            <div>Username:</div>
                            <input type="text" onChange={(username) => this.setState({ username: username.target.value })}/>
                        </div>
                        <div className="form-item">
                            <div>Password:</div>
                            <input type="password" onChange={(password) => this.setState({ password: password.target.value })}/>
                        </div>
                        <div className="form-error">{ this.state.error_msg }</div>

                        <div className="form-item">
                            <div className="login-submit" onClick={this.login}>Log-In</div>
                        </div>
                    </div>
                </div>

                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        )
    }
}

export default login;
