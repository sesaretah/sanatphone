import React from 'react';
import {
  Page,
  Navbar,
  NavLeft,
  NavTitle,
  NavRight,
  Link,
  Toolbar,
  Block,
  BlockTitle,
  List,
  ListInput,
  ListItem,
  Row,
  Col,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  BlockFooter,
  LoginScreenTitle,
  ListButton,
  Segmented
} from 'framework7-react';

import * as MyActions from "../../actions/MyActions";
import MessageStore from "../../stores/MessageStore";
import MyStore from "../../stores/MyStore";
import { dict} from '../Dict';
import logo from  "../../images/logo.png";

export default class Message extends React.Component {

  constructor(props) {
    super(props);
    this.getGroups = this.getGroups.bind(this)

    this.state = {
      groups: [],
      token: localStorage.getItem('token'),
    };
  }

  componentWillMount() {
    MessageStore.on("groups", this.getGroups);
  }

  componentWillUnmount() {
    MessageStore.removeListener("groups", this.getGroups);
  }

  componentDidMount(){
    MyActions.groupedMessages(this.state.token);
  }


  getGroups(){
    var groups = MessageStore.getGroups();
    console.log(groups);
    this.setState({groups: groups});
  }

  createItem(){
    var length = this.state.groups.length;
    let items = []
    for (let i = 0; i < length; i++) {
      items.push(<ListItem
        link={'/rooms/' + this.state.groups[i].id}
        title={this.state.groups[i].title}
        after=""
        subtitle=""
        text=""
        badge=""
        >
      </ListItem>);
    }
    return items
  }

  render() {
    return (
      <Page loginScreen>
        <Navbar>
          <NavTitle>
            <img src={logo} alt="Logo" className="logo" />
          </NavTitle>
        </Navbar>

        <List  simple-list>
          {this.createItem()}
        </List>

        <Toolbar tabbar labels color="blue" bottomMd={true}>
          <Link href="#tab-1"><i class="f7-icons">data</i></Link>
          <Link href="/new_cam_advert/"><i class="f7-icons">add_round</i></Link>
          <Link href="/"><i class="f7-icons">home</i></Link>
          <Link href="/login/"><i class="f7-icons">person_round</i></Link>
        </Toolbar>
      </Page>
    )
  }

}
