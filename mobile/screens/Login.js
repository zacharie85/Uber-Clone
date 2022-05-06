import React, { Component } from 'react'
import { StyleSheet, Platform, View, Text } from 'react-native';
import Loginform from './LoginForm';

export default class Login extends Component {
    constructor (props){
        super(props);

        this.state={
            email:'',
            password:'',
            errorMessage:''
        };

        this.handleChange =  this.handleChange.bind(this);
    }
    handleChange (name,value){
        this.setState(prevState =>({
            ...prevState,
            [name]:value
        }))
    };

    render() {
        const {email,password,errorMessage} = this.state;

        return (
            <View style={styles.constainer}>
                <Text style={styles.headerTexte}> Taxi App</Text>
                <Loginform enail={email}  password={password} errorMessage={errorMessage} handleChange={this.handleChange}/>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    constainer: {
        flex: 1,
        backgroundColor: 'black'
    },
    headerTexte: {
        fontSize: 44,
        color: 'green',
        marginTop: 80,
        textAlign: 'center',
        fontWeight: "200",
        fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined
    }
})
