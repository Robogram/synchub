import React, { Component } from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { isMobile } from 'react-device-detect'
import 'normalize.css'
import './App.css'

// pages
import Main from './pages/main'
import Register from './pages/register'
import Login from './pages/login'
import RecoverPassword from './pages/recover_password'
import ResetPassword from './pages/reset_password'
import Terms from './pages/terms'
import Privacy from './pages/privacy'
import Verified from './pages/verified'

import Home from './pages/home'
import CreateRepos from './pages/create_repos'
import GettingStarted from './pages/getting_started'
import PriceLayout from './pages/price_layout'
import Payment from './pages/payment'

class App extends Component {
    render() {
        var userid = localStorage.getItem("userid")

        if (!isMobile)
            return (
                <BrowserRouter>
                    <div>
                        <Switch>
                            <Route path="/" exact render={props => (
                                userid !== '' && userid !== null ? 
                                    <Redirect to={{ pathname: '/main' }}/>
                                    :
                                    <Redirect to={{ pathname: '/home' }}/>
                            )}/>
                            <Route path="/home" component={Home}/>
                            <Route path="/register" component={Register}/>
                            <Route path="/login" component={Login}/>
                            <Route path="/main" component={Main}/>
                            <Route path="/recover_password" component={RecoverPassword}/>
                            <Route path="/reset_password/:userid" component={ResetPassword}/>
                            <Route path="/terms" component={Terms}/>
                            <Route path="/privacy" component={Privacy}/>
                            <Route path="/verified/:userid" component={Verified}/>
                            <Route path="/price_layout" component={PriceLayout}/>
                            <Route path="/create_repos" component={CreateRepos}/>
                            <Route path="/getting_started" component={GettingStarted}/>
                            <Route path="/payment/:userid" component={Payment}/>
                        </Switch>
                    </div>
                </BrowserRouter>
            )

        return <div className="mobile-comp-box">Only Browser Compatible</div>
    }
}

export default App;
