import React, { Component } from 'react';
import 'normalize.css';
import './verified.css';
import link from '../link'

class verified extends Component {
    constructor(props) {
        super(props)

        var { params } = props.match;
        var { userid } = params;

        this.state = {
            userid: userid,
            seconds: 3
        }

        this.isUserExist(userid)
        setInterval(this.redirect, 1000)
    }
    isUserExist(userid) {
        var form_data = new FormData()

        form_data.append("userid", userid)

        fetch(link + 'get_user_actions', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error

            if (error) {
                window.location = '/login'
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
        var { seconds } = this.state

        return (
            <div className="verified">
                <div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                </div>
                <div className="verified_box">
                    <div className="verified-row">
                        <div className="verified-logo-holder"><img className="verified-logo" alt="" src="https://www.synchub.ca/images/verified.png"/></div>
                        <div className="verified-logo-header">You are officially verified</div>
                        <div className="verified-logo-header">Redirecting in {seconds}</div>
                    </div>
                </div>
                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        );
    }
}

export default verified;
