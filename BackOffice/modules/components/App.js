import React from 'react'
import { IndexLink, Link } from 'react-router'
import Title from 'react-title-component'
import styles from './app.css'
import logo from './logo.png'

export default React.createClass({
  render() {
    return (
      <div className={styles.App}>
        <div className={styles.TopBar}>
            <Title render="Tweek"/>
            <IndexLink to="/"><img src={logo} /></IndexLink>  
            <ul className={styles.Menu} >
            <li><Link to="/rules">Rules</Link></li>
            <li><Link to="/keys">keys</Link></li>
            </ul>
        </div>
        {this.props.children}
      </div>
    )
  }
})

