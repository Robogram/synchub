import React, { Component } from 'react';
import 'normalize.css';
import './terms.css';

class terms extends Component {
    constructor(props) {
        super(props)

        this.state = {
            userid: localStorage.getItem("userid")
        }
    }
    render() {
        var { userid } = this.state
        
        return (
            <div className="terms">
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
                <div className="terms_box">
                	<div className="terms-main-header">Terms (Last Updated: Thursday, December 6, 2018)</div>

                	<div className="terms-main-about">
                        Welcome to Synchub. We are very happy you chose to be here to manage your projects.

                        <br/>
                        <br/>
                        <br/>
                        <br/>

                        By using the Platform, you agree to the Terms. You should be able to follow the Rules 
                        easily since it's really simple.

                        <br/>
                        <br/>
                        <br/>
                        <br/>

                        Please read these Terms carefully before accessing or using the platform. 
                        By accessing or using any part of the site, you agree to be bound by these 
                        Terms. If you do not agree to all the terms of this agreement, then you 
                        may not access the website or use any services. If these Terms are considered 
                        an offer, acceptance is expressly limited to these Terms.

                        <br/>
                        <br/>
                        <br/>
                        <br/>

                        Our Platform is hosted on DigitalOcean. They provide us all the tools we need 
                        to keep you and your information secure at all times.
                    </div>

                	<ul className="terms-main-ruleslist">
                		<li>Accuracy, Completeness and Timeliness or Information</li>
                        <p>We are not responsible if information made available on this site is not accurate, 
                        complete or current. The material on this site is provided for general information 
                        only and should not be relied upon or used as the sole basis for making decisions 
                        without consulting primary, more accurate, more complete or more timely sources of 
                        information. Any reliance on the material on this site is at your own risk. This 
                        site may contain certain historical information. Historical information, necessarily, 
                        is not current and is provided for your reference only. We reserve the right to modify 
                        the contents of this site at any time, but we have no obligation to update any 
                        information on our site. You agree that it is your responsibility to monitor changes 
                        to our site.</p>

                        <li>Personal Information</li>
                        <p>The use of personal information through the site is stated by our <a style={{ color: 'blue' }} href="/privacy">Privacy</a>.</p>

                        <li>Disclaimer of Warranties; Limitation of Liability</li>
                        <p>We do not guarantee, represent or warrant that your use of our service will be uninterrupted, 
                        timely, secure or error-free. We do not warrant that the results that may be obtained from 
                        the use of the service will be accurate or reliable. You agree that from time to time we may 
                        remove the service for indefinite periods of time or cancel the service at any time, without 
                        notice to you.</p>

                        <li>Indemnification</li>
                        <p>You agree to indemnify, defend and hold harmless Synchub and our parent, subsidiaries, affiliates, 
                        partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, 
                        suppliers, interns and employees, harmless from any claim or demand, including reasonable attorneys’ 
                        fees, made by any third-party due to or arising out of your breach of these Terms or the documents 
                        they incorporate by reference, or your violation of any law or the rights of a third-party.</p>

                        <li>Severability</li>
                        <p>In the event that any provision of these Terms is determined to be unlawful, void or unenforceable, 
                        such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and 
                        the unenforceable portion shall be deemed to be severed from these Terms, such determination shall not 
                        affect the validity and enforceability of any other remaining provisions.</p>

                        <li>Entire Agreement</li>
                        <p>The failure of us to exercise or enforce any right or provision of these Terms shall not constitute a 
                        waiver of such right or provision. These Terms and any policies or operating rules posted by us on this 
                        site or in respect to The Service constitutes the entire agreement and understanding between you and 
                        us and govern your use of the Service, superseding any prior or contemporaneous agreements, communications 
                        and proposals, whether oral or written, between you and us (including, but not limited to, any prior 
                        versions of the Terms). Any ambiguities in the interpretation of these Terms shall not be construed 
                        against the drafting party.</p>

                        <li>Changes to Terms of Use</li>
                        <p>You can review the most current version of the Terms at any time at this page. We reserve the right, 
                        at our sole discretion, to update, change or replace any part of these Terms by posting updates and changes 
                        to our website. It is your responsibility to check our website periodically for changes. Your continued use 
                        of or access to our website or the Service following the posting of any changes to these Terms constitutes 
                        acceptance of those changes.</p>
                	</ul>
                </div>

                <div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        );
    }
}

export default terms;
