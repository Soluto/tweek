import React, { Fragment } from "react";
import { mapPropsStream, setDisplayName, compose } from "recompose";
import { Observable } from "rxjs";
import md5 from "md5";
import styled from "react-emotion";
import { Link } from 'react-router-dom';
import fetch from "../utils/fetch";

const Container = styled("div")`
    display: flex;
    background-color: #00506D;
    width: 166px;
    justify-content: flex-end;
    border-left: 1px solid #eee;
    flex-direction: row;
    height: 100%;
    color: white;
    align-items: center;
    padding-right:10px;
  `;

const withCurrentUser = compose(setDisplayName("WithCurrentUser"),mapPropsStream(props$=>
  Observable.combineLatest(Observable.defer(()=>fetch("/current-user").then(x=>x.json()) ), 
    props$, (user,props)=> ({
      ...props,
      user,
    }))));

const UserBar = setDisplayName("UserBar")(({ user })=>
  (
    <Container>
      <div style={{ marginRight: 16, textAlign:"right" }}>
        <div style={{ fontWeight: 200 }}>{user.Name || user.User}</div>
        <Link style={{ color: "white","fontSize": 12 }} to="/logout">Logout</Link>
      </div>
      <div>
        <img src={`https://www.gravatar.com/avatar/${md5(user.Email || user.User)}?s=45&d=identicon`} />
      </div>
    </Container>
  ));

export default withCurrentUser(UserBar);