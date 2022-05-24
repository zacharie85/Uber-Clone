import React, { Component } from 'react'
import { StyleSheet, Platform, View, Text, Alert } from 'react-native';
import Loginform from './LoginForm';
import axios from 'axios';
import baseURL from '../baseUrl';

axios.defaults.baseURL =baseURL;

export default class Login extends Component {
    constructor (props){
        super(props);

        this.state={
            email:'',
            password:'',
            errorMessage:''
        };

        this.handleChange =  this.handleChange.bind(this);
        this.handleSignIn = this.handleSignIn.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this)
    }
    handleChange (name,value){
        this.setState(prevState =>({
            ...prevState,
            [name]:value
        }))
    };

    async handleSignIn(){
        this.setState({errorMessage:''})
        const {email,password} = this.state;

        try{
          const result =  await axios.post("/auth/login",{email,password});
             Alert.alert('Attention',result.data.token);

         // console.log(result.data)
        }catch(error){
            console.log(error.response);
            this.setState({errorMessage:error.response.data.message})
        }
    }

    async handleSignUp(){
        this.setState({errorMessage:''})
        const {email,password} = this.state;

        try{
          const result =  await axios.post("/auth/signup",{email,password});
          Alert.alert('Attention',result.data.token);
        }catch(error){
            this.setState({errorMessage:error.response.data.message})
        }
    }

    render() {
        const {email,password,errorMessage} = this.state;

        return (
            <View style={styles.constainer}>
                <Text style={styles.headerTexte}> Taxi App</Text>
                <Loginform enail={email}  password={password} errorMessage={errorMessage} handleChange={this.handleChange} 
                handleSignIn={this.handleSignIn}
                handleSignUp={this.handleSignUp}
                />
                <Text style={styles.error}>{this.state.errorMessage}</Text>
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
    },
    error:{
        fontSize:44,
        textAlign:'center',
        color:'#C1D76D',
        fontFamily:Platform.OS === 'android' ? 'sans-serif-light' : undefined,
        marginTop:30,
        fontWeight:'200'
    }
})
