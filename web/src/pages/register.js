import React, { Component } from 'react'
import './register.css'
import link from '../link'

class register extends Component {
    constructor(props) {
        super(props)

        if (localStorage.getItem("userid") !== null) {
            window.location = "/main"
        }

        this.state = {
            username: "",
            email: "",
            password: "",
            confirmpassword: "",
            error_msg: ""
        }
    }
    register = () => {
        var form_data = new FormData()
        var { username, email, password, confirmpassword } = this.state

        form_data.append('username', username)
        form_data.append('email', email)
        form_data.append('password', password)
        form_data.append('confirmpassword', confirmpassword)

        fetch(link + "register", {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var userid, error_msg

            if (!error) {
                userid = response.userid

                localStorage.setItem("userid", userid)

                window.location = '/create_repos'
            } else {
                error_msg = response.error_message

                this.setState({ 'error_msg': error_msg })
            }
        })
    }
    render() {
        return (
            <div className="register">
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
                <div className="register-info">Manage your repositories synchronously using an API. No more (CLI) Command-Line-Interface</div>
                <div className="register-form_box">
                    <div className="register-form">
                        <div className="form-header">Register</div>

                        <div className="form-item">
                            <div>Username:</div>
                            <input type="text" onChange={(username) => this.setState({ 'username': username.target.value })}/>
                        </div>
                        <div className="form-item">
                            <div>E-mail:</div>
                            <input type="text" onChange={(email) => this.setState({ 'email': email.target.value })}/>
                        </div>
                        <div className="form-item">
                            <div>Password:</div>
                            <input type="password" onChange={(password) => this.setState({ 'password': password.target.value })}/>
                        </div>
                        <div className="form-item">
                            <div>Confirm Password:</div>
                            <input type="password" onChange={(confirmpassword) => this.setState({ 'confirmpassword': confirmpassword.target.value })}/>
                        </div>
                        <div className="form-error">{ this.state.error_msg }</div>

                        <div className="form-item">
                            <div className="register-submit" onClick={this.register}>Register</div>
                        </div>
                    </div>
                </div>
                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        );
    }
}

export default register;
