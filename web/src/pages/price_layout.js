import React, { Component } from 'react'
import './price_layout.css'

class price_layout extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userid: localStorage.getItem("userid")
        }
    }
    render() {
        var { userid } = this.state

        return (
            <div className="price_layout">
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
                <div className="price_layout_box">
                	<div className="price_layout-priceplan-header">Our Plan</div>
                	<div className="price_layout-box">
                		<div className="price_layout-priceplan">
                			<div className="price_layout-priceplan-plan">1 Month Free Trial</div>

                			<ul className="price_layout-list">
                				<li>1 Repository</li>
                				<li>15 MB Max</li>
                			</ul>
                		</div>
                		<div className="price_layout-priceplan">
                			<div className="price_layout-priceplan-plan">$ 1.99 / Monthly</div>

                			<ul className="price_layout-list">
                				<li>1+ Repositories (5 Max)</li>
                				<li>15 MB Max Each</li>
                			</ul>
                		</div>
                	</div>
                </div>

            	<div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        );
    }
}

export default price_layout;
