import React, { Component } from 'react'
import './create_repos.css'
import link from '../link'

class create_repos extends Component {
    constructor(props) {
        super(props)

        if (localStorage.getItem("userid") === null) {
            window.location = "/login"
        }

        this.state = {
            userid: localStorage.getItem("userid"),
            repos_name: ""
        }
    }
    create = () => {
        var form_data = new FormData()
        var { userid, repos_name } = this.state

        form_data.append('userid', userid)
        form_data.append('repos-name', repos_name)

        fetch(link + "create_repos", {
            method: 'POST',
            body: form_data
        })
        .then((response) => response.json())
        .then((response) => {
            var error = response.error
            var error_msg

            if (!error) {
                window.location = '/getting_started'
            } else {
                error_msg = response.error_message

                this.setState({ 'error_msg': error_msg })
            }
        })
    }
    render() {
        return (
            <div className="create_repos">
            	<div className="index-header">
                    <div className="index-header-row">
                        <a className="index-page" href="/home">
                            <img className="index-logo" alt="" src="https://www.synchub.ca/images/logo.png"/>
                            <div className="index-title">Synchub</div>
                        </a>
                    </div>
                </div>
                <div className="create_repos-header">Create your first repository</div>
                <div className="form_box">
                    <div className="create_repos-form">
                        <div className="form-item">
                            <div>Repository Name:</div>
                            <input type="text" onChange={(repos_name) => this.setState({ 'repos_name': repos_name.target.value })}/>
                        </div>
                        <div className="form-error">{ this.state.error_msg }</div>

                        <div className="form-item">
                            <div className="create_repos-submit" onClick={this.create}>Create</div>
                        </div>
                    </div>
                </div>

            	<div className="footer">@ 2018 Geottuse, Inc. All Rights Reserved</div>
            </div>
        )
    }
}

export default create_repos;
