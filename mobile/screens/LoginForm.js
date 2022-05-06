import React, { Component } from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity, Text } from 'react-native';

export default class Loginform extends Component {

    render() {
        return (
            <View>
                <TextInput style={styles.styleImput}
                    placeholder="yourEmail@gmail.com"
                    placeholderTextColor={"black"}
                    keyboardType={'email-address'}
                    autoCapitalize={false}
                    autoCorrect={false}
                    value={this.props.email}
                    onChangeText={(text)=>{
                        this.props.handleChange("email", text)
                    }}
                />
                <TextInput style={styles.styleImput}
                    placeholder="password"
                    placeholderTextColor={"black"}
                    autoCapitalize={false}
                    secureTextEntry={true}
                    value={this.props.password}
                    onChangeText={(text)=>{
                        this.props.handleChange("password", text)
                    }}
                />

                <TouchableOpacity style={styles.bottom}>
                    <Text style={styles.bottomText}> SIGN IN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottom}>
                    <Text style={styles.bottomText}>CREATE ACCOUNT</Text>
                </TouchableOpacity>
            </View>
        );
    }

};

const styles = StyleSheet.create({
    styleImput: {
        height: 40,
        backgroundColor: 'white',
        color: 'black',
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        marginTop: 10
    },
    bottom: {
        backgroundColor: 'green',
        paddingVertical: 20,
        marginTop: 20
    },
    bottomText: {
        textAlign: 'center',
        fontSize: 23,
        color: 'black'
    }
})