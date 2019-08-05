import React, { Component } from 'react'
import './recover_password.css'
import link from '../link'

class recover_password extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userid: localStorage.getItem("userid"),
            email: "",
            error_msg: "",
            sent_box: false
        }
    }
    recover = () => {
        var form_data = new FormData()
        var { email } = this.state

        form_data.append("email", email)

        fetch(link + 'recover_password', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var error_msg

            if (!error) {
                this.setState({ 'sent_box': true })
            } else {
                error_msg = response.error_message

                this.setState({ 'error_msg': error_msg })
            }
        })
    }
    render() {
        var { userid, sent_box } = this.state

        return (
            <div className="recover_password">
                <div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                    { userid != null ? 
                        <div className="index-signout" onClick={() => {
                            localStorage.clear()

                            window.location = '/login'
                        }}>Sign-Out</div>
                    : null }
                </div>
                {userid != null ? 
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
                <div className="recover_password-info">Manage your repositories synchronously using an API. No more (CLI) Command-Line-Interface</div>
                <div className="recover_password-form_box">
                    <div className="recover_password-form">
                        <div className="form-header">Recover Password</div>

                        <div className="form-item">
                            <div>E-mail:</div>
                            <input type="text" onChange={(email) => this.setState({ email: email.target.value })}/>
                        </div>
                        <div className="form-error">{ this.state.error_msg }</div>

                        <div className="form-item">
                            <div className="recover_password-submit" onClick={this.recover}>Recover</div>
                        </div>
                    </div>
                </div>

                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>

                { sent_box ? 
                    <div className="hidden_boxes">
                        <div className="hidden-row">
                            { sent_box ? 
                                <div className="sent">
                                    <div className="sent-header">We've sent you a link to reset your password</div>
                                    <div className="sent-button" onClick={() => this.setState({ 'sent_box': false })}>Ok</div>
                                </div>
                            : null }
                        </div>
                    </div>
                : null }
            </div>
        );
    }
}

export default recover_password;
