import React, { Component } from 'react'
import 'normalize.css'
import './home.css'

import platform from 'platform'

class home extends Component {
    constructor(props) {
        super(props)

        if (localStorage.getItem("userid") !== null) {
            window.location = "/main"
        }
    }
    render() {
        var operating_sys = String(platform.os)

        return (
            <div className="home">
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
                <img className="home-masthead" alt="" src="https://www.synchub.ca/images/masthead.jpg"/>
                <div className="home-explain_box">
                	<div className="explain-sentence">Tired of using terminal and cmd to manage your repositories ?</div>
                	<div className="explain-sentence-sep-short"></div>
                	<div className="explain-sentence">Try out our easy-to-use API to manage your repository(s) and navigate through your file(s) and folder(s)</div>
                    <div className="download-here">
                        { 
                            operating_sys.replace("OS X", "") !== operating_sys ||
                            operating_sys.replace("Windows", "") !== operating_sys ? 
                                operating_sys.replace("OS X", "") !== operating_sys ? 
                                    <a className="download-button" href="https://www.synchub.ca/Synchub-mac.zip" download>Download for Mac</a>
                                :
                                    <a className="download-button" href="https://www.synchub.ca/Synchub-win.zip" download>Download for Windows</a>
                            :
                            <div className="download-button-disabled">Compatible OS: MacOS & Windows</div>
                        }
                    </div>
                    
                	<div className="explain-sentence">So, how does it work ?</div>
                	<div className="explain-sentence">You download and run the software</div>
                	<div className="explain-sentence-sep-short"></div>
                	<div className="explain-sentence">Sign-up / Log-In</div>
                	<div className="explain-sentence-sep-short"></div>
                	<div className="explain-sentence">A folder with your username containing your repository will appear on your desktop</div>
                	<div className="explain-sentence-sep_box">
                		<img className="explain-photo" alt="" src="https://www.synchub.ca/images/desktop.png"/>
                		<div className="explain-sentence-sep-long"></div>
                		<img className="explain-photo" alt="" src="https://www.synchub.ca/images/imac.png"/>
                	</div>
                	<div className="explain-sentence">Now the fun part, whatever folder(s) and/or file(s) you put in the folder will be controllable using the software</div>
                	<div className="explain-sentence-sep-short"></div>
                	<div className="explain-sentence">With the software, you can add, commit, and pull folder(s) and/or file(s)</div>
                	<div className="explain-sentence-sep-short"></div>
                	<div className="explain-sentence">You will need to log into the site to see the source codes of your file(s)</div>
                    <div className="explain-sentence-sep-short"></div>
                    <div className="explain-sentence">That's It !</div>
                </div>

                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        )
    }
}

export default home;
