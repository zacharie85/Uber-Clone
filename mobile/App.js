import React, { Component } from 'react';
import Map from './screens/Map';
import { View, Button } from 'react-native';
import Passenger from './screens/Passenger';
import Driver from './screens/Driver';

export default class App extends Component {

  constructor(props) {
    super(props);

    this.state={
      isPassenger:false,
      isDriver:false
    }
  }

  render() {
    if(this.state.isPassenger){
      return <Passenger/>
    }

    if(this.state.isDriver){
      return <Driver/>
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Button title="Paasenger"  onPress={() => this.setState(presState=>({
          ...presState,
          isPassenger:true,
          isDriver:false
        }))}/>
        <Button title="Driver"  onPress={() => this.setState(presState=>({
          ...presState,
          isPassenger:false,
          isDriver:true
        }))}/>
      </View>
    )
  }
}
