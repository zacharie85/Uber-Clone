import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { StyleSheet, View, TextInput, Text } from 'react-native';
import React, { Component } from 'react';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import PlaceInput from '../components/PlaceInput.js'

const apiKey = 'AIzaSyCynyadVP6y0U3WS6-BTeJae2da6tDlMXE';
export default class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      latitude: 10,
      longitude: 0,
      error: null,
      destination: "",
      predictions: []
    }
  }

  getLocation() {
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        })
      }, error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 1000000, maximumAge: 10000000 }
    )
  }

  componentDidMount() {
    this.getLocation();
  }

  async onCHnageDestination(destination) {
    this.setState({ destination: destination });
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}
    &input=${destination}
    &location=${this.state.latitude},${this.state.longitude}
    &radius=200`;

    try {
      const result = await axios.get(apiUrl);
      // const json = await result.json(); 
      const {
        data: { predictions }
      } = await axios.get(apiUrl);
      this.setState({ predictions: predictions });
    } catch (error) {
      console.log(error);
    }
  }

  handlePredictionPress(){
    console.log('ici');
  }

  render() {
    const { latitude, longitude } = this.state;
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}
        >
          <PlaceInput latitude={latitude} longitude={longitude} onPredictionPress={handlePredictionPress} />
        </MapView>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: 700,
    width: 400,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  textInput: {
    alignItems: 'center',
    marginTop: 50,
    height: 40, borderWidth: 1, marginLeft: 5, marginRight: 15,
    padding: 5, backgroundColor: 'white'
  }
});