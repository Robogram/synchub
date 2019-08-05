import React, { Component } from 'react'
import './payment.css'
import link from '../link'

class payment extends Component {
    constructor(props) {
        super(props)

        var { params } = props.match;
        var { userid } = params;

        if (localStorage.getItem("userid") === null || userid === '') {
            localStorage.setItem("pay_time", true)

            window.location = "/login"
        }

        this.state = {
            userid: userid,
            name: '',
            number: '',
            cvc: '',
            exp_month: '',
            exp_year: '',
            address_line1: '',
            address_line2: '',
            address_city: '',
            address_state: '',
            address_zip: '',
            address_country: '',
            error_msg: "",

            enable_pay_button: true,
            show_payed_success_box: false,
            show_save_credit_info_success_box: false
        }

        this.getCardInfo()
    }
    componentDidMount() {
        window.Stripe.setPublishableKey('pk_live_4LfTKkJy9EphXqoRroPufRyE')
    }
    getCardInfo = () => {
        var form_data = new FormData()
        var userid = this.state.userid

        form_data.append('userid', userid)

        fetch(link + 'get_card_info', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var enable_pay_button

            if (!error) {
                var {
                    name, number, cvc, exp_month, exp_year, address_line1,
                    address_line2, address_city, address_state, address_zip,
                    address_country
                } = response.credit_card
                enable_pay_button = response.enable_pay_button

                this.setState({
                    'name': name, 'number': number, 'exp_month': exp_month, 'exp_year': exp_year, 
                    'cvc': cvc, 'address_line1': address_line1, 'address_line2': address_line2, 
                    'address_city': address_city, 'address_state': address_state, 'address_zip': address_zip, 
                    'address_country': address_country, 'enable_pay_button': enable_pay_button
                })
            }
        })
    }
    pay = (e) => {
        var form_data = new FormData()
        var { 
            userid, name, number, exp_month, exp_year, cvc, address_line1, address_line2, address_city,
            address_state, address_zip, address_country
        } = this.state, self = this
        var credit_info = { 
            'name': name, 'number': number, 'exp_month': exp_month, 'exp_year': exp_year, 'cvc': cvc,
            'address_line1': address_line1, 'address_line2': address_line2, 'address_city': address_city,
            'address_state': address_state, 'address_zip': address_zip, 'address_country': address_country
        }

        window.Stripe.createToken(credit_info, function (status, token) {
            form_data.append("userid", userid)
            form_data.append("credit_info", JSON.stringify(credit_info))

            if (token.id !== undefined) {
                token = token.id
            } else {
                token = ''
            }

            form_data.append("token", token)

            fetch(link + 'charge_user', {
                method: 'POST',
                body: form_data
            })
            .then((response) => response.json())
            .then((response) => {
                var error = response.error
                var error_msg

                if (!error) {
                    self.setState({ 'show_payed_success_box': true })
                } else {
                    error_msg = response.error_message

                    self.setState({ 'error_msg': error_msg })
                }
            })
        })
    }
    save = (e) => {
        var form_data = new FormData()
        var { 
            userid, name, number, exp_month, exp_year, cvc, address_line1, address_line2, address_city,
            address_state, address_zip, address_country
        } = this.state
        var credit_info = { 
            'name': name, 'number': number, 'exp_month': exp_month, 'exp_year': exp_year, 'cvc': cvc,
            'address_line1': address_line1, 'address_line2': address_line2, 'address_city': address_city,
            'address_state': address_state, 'address_zip': address_zip, 'address_country': address_country
        }

        form_data.append('userid', userid)
        form_data.append('credit_card', JSON.stringify(credit_info))

        fetch(link + 'save_credit_info', {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error

            if (!error) {
                this.setState({ 'show_save_credit_info_success_box': true })
            }
        })
    }
    render() {
        var { 
            userid, name, number, exp_month, exp_year, cvc, address_line1, 
            address_line2, address_city, address_state, address_zip, address_country, 
            enable_pay_button, show_payed_success_box, show_save_credit_info_success_box 
        } = this.state

        return (
            <div className="payment">
            	<div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                    { userid !== null ? 
                        <div className="index-signout" onClick={() => {
                            localStorage.clear()

                            window.location = '/login'
                        }}>Sign-Out</div>
                    : null }
                </div>
                <div className="nav_bars-in">
                    <div className="nav_bar" onClick={() => { window.location = '/main' }}>Repository(s)</div>
                    <div className="nav_bar" onClick={() => { window.location = '/price_layout' }}>Pricing</div>
                    <div className="nav_bar" onClick={() => { window.location = '/payment/' + userid }}>Billing</div>
                    <div className="nav_bar" onClick={() => { window.location = '/recover_password' }}>Recover Password</div>
                    <div className="nav_bar" onClick={() => { window.location = '/terms' }}>Terms</div>
                    <div className="nav_bar" onClick={() => { window.location = '/privacy' }}>Privacy</div>
                    <div className="nav_bar"><a href="mailto:admin@geottuse.com?Subject=Report%20a%20bug%20or%20ask%20a%20question">Contact</a></div>
                </div>
                <div className="payment-form_box">
                    <div className="payment-form">
                        <div className="form-item">
                            <div>Name on Card:</div>
                            <input type="text" className="default-text" onChange={(name) => this.setState({ name: name.target.value })} data-stripe="name" value={name}/>
                        </div>

                        <div className="form-item">
                            <div>Card Number:</div>
                            <input type="text" className="default-text" onChange={(number) => this.setState({ number: number.target.value })} data-stripe="number" value={number}/>
                        </div>

                        <div className="form-row">
                            <div className="form-item">
                                <div>Expiry Date</div>
                                <div className="form-row">
                                    <div className="form-item">
                                        <input className="mini-text" type="text" onChange={(exp_month) => this.setState({ exp_month: exp_month.target.value })} maxlength="2" placeholder="MM" data-stripe="exp-month" value={exp_month}/>
                                    </div>
                                    <div className="form-item">
                                        <input className="mini-text" type="text" onChange={(exp_year) => this.setState({ exp_year: exp_year.target.value })} maxlength="4" placeholder="YYYY" data-stripe="exp-year" value={exp_year}/>
                                    </div>
                                </div>
                            </div>
                            <div className="form-item">
                                <div>Security Code</div>
                                <div className="form-item">
                                    <input className="mini-text" type="text" onChange={(cvc) => this.setState({ cvc: cvc.target.value })} placeholder="CVC" maxlength="3" data-stripe="cvc" value={cvc}/>
                                </div>
                            </div>
                        </div>

                        <div className="form-item">
                            <div>Address 1:</div>
                            <input className="default-text" type="text" onChange={(address_line1) => this.setState({ address_line1: address_line1.target.value })} data-stripe="address-line1" value={address_line1}/>
                        </div>

                        <div className="form-item">
                            <div>Address 2:</div>
                            <input className="default-text" type="text" placeholder="Optional" onChange={(address_line2) => this.setState({ address_line2: address_line2.target.value })} data-stripe="address-line2" value={address_line2}/>
                        </div>

                        <div className="form-item">
                            <div>City</div>
                            <input className="default-text" type="text" onChange={(address_city) => this.setState({ address_city: address_city.target.value })} data-stripe="address-city" value={address_city}/>
                        </div>

                        <div className="form-item">
                            <div>State</div>
                            <input className="default-text" type="text" onChange={(address_state) => this.setState({ address_state: address_state.target.value })} data-stripe="address-state" value={address_state}/>
                        </div>

                        <div className="form-item">
                            <div>Postal Code</div>
                            <input className="default-text" type="text" onChange={(address_zip) => this.setState({ address_zip: address_zip.target.value })} maxlength="6" data-stripe="address-zip" value={address_zip}/>
                        </div>

                        <div className="form-item">
                            <div>Country</div>
                            <input className="default-text" type="text" onChange={(address_country) => this.setState({ address_country: address_country.target.value })} data-stripe="address-country" value={address_country}/>
                        </div>

                        <div className="form-error">{ this.state.error_msg }</div>

                        <div className="form-row">
                            <div className="form-item">
                                { enable_pay_button ?
                                    <div className="enable-payment-submit" onClick={this.pay}>Pay Now</div>
                                    :
                                    <div className="disable-payment-submit">Pay Now</div>
                                }
                            </div>
                            <div className="form-item">
                                <div className="payment-save-submit" onClick={this.save}>Save</div>
                            </div>
                        </div>
                    </div>
                </div>

            	<div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>

                { show_payed_success_box || show_save_credit_info_success_box ? 
                    <div className="hidden_boxes">
                        <div className="hidden-row">
                            { show_save_credit_info_success_box ? 
                                <div className="save_credit_info-success">
                                    <div className="save_credit_info-header">Your credit card info(s) are saved</div>
                                    <div className="save_credit_info-button" onClick={() => this.setState({ 'show_save_credit_info_success_box': false })}>Ok</div>
                                </div>
                            : null }

                            { show_payed_success_box ? 
                                <div className="payed-success">
                                    <div className="payed-header">You have paid $1.99 for this month</div>
                                    <div className="payed-button" onClick={() => this.setState({ 'enable_pay_button': false, 'show_payed_success_box': false })}>Ok</div>
                                </div>
                            : null }
                        </div>
                    </div>
                : null }
            </div>
        )
    }
}

export default payment;
