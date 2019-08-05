import React, { Component } from 'react'
import './getting_started.css'
import link from '../link'

class getting_started extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userid: localStorage.getItem("userid"),
            seconds: 5
        }

        this.getStarted()
        setInterval(this.redirect, 1000)
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
    getStarted = () => {
        var form_data = new FormData()
        var { userid } = this.state

        form_data.append("userid", userid)

        fetch(link + 'get_user_info', { 
            method: 'POST',
            body: form_data
        })
    }
    render() {
        var { seconds } = this.state

        return (
            <div className="getting_started">
            	<div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                </div>
                <div className="getting_started_box">
                    <div className="getting_started-info">Thank you for choosing Synchub for your project(s).</div>
                    <div className="getting_started-info">Download the software and login to start managing your repository(s)</div>
                    <div className="getting_started-download">Download</div>
                    <div className="getting_started-info">Redirecting to your Repository(s) in {seconds}</div>
                </div>
            	<div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        )
    }
}

export default getting_started;
