import React, { Component } from 'react';
import './privacy.css';

class privacy extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userid: localStorage.getItem("userid")
        }
    }
    render() {
        var { userid } = this.state
        
        return (
            <div className="privacy">
            	<div className="privacy-header">
                    <div className="privacy-header-row">
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
                <div className="privacy_box">
                	<div className="privacy-main-header">Privacy (Last Updated: Thursday, December 6, 2018)</div>

                	<div className="privacy-main-about">Thank you for choosing to use Synchub to manage your project(s). The terms below will layout all 
                	the rules you must follow in order to use the service. By reading and understanding the rules below, you will be eligible to use the service
                	without any worries of future consequences.</div>

                	<ul className="privacy-main-ruleslist">
                		<li>What personal information do we collect from every user ?</li>
                		<ul>
                            <li className="inner_list">E-mail</li>
                            <li className="inner_list">Username</li>
                            <li className="inner_list">Password</li>
                            <li className="inner_list">Credit Card (only when ask for payment)</li>
                        </ul>

                        <li>When do we collect information ?</li>
                        <p>We collect your username and e-mail during registration. We will only collect your
                        credit card information when we ask to charge you</p>

                        <li>How do we use your information ?</li>
                        <p>We will process and charge you programmically only when neccesary. We will use your e-mail 
                        to send you updates about our service and password reset request if you ever 
                        forget your password</p>

                        <li>How do we protect your information and data ?</li>
                        <p>We only be asking for information we need and when neccesary. We promise we will never share any of 
                        your information and data with other websites.</p>
                	</ul>
                </div>

                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        );
    }
}

export default privacy;
