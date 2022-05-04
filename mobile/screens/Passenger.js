import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { StyleSheet, View, Text, Keyboard, Dimensions, ActivityIndicator, TouchableWithoutFeedback, TouchableOpacity, Image } from 'react-native';
import React, { Component } from 'react';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import PlaceInput from '@components/PlaceInput';
import SocketIO from 'socket.io-client';
import { BASE_URL, API_KEY, prefix, getRoute, decodePoint } from '../utiles/Helpers'
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');
const car = require('../assets/images/car.png');

export default class Passenger extends Component {

    constructor(props) {
        super(props);

        this.state = {
            latitude: 0,
            longitude: 0,
            coordinates: [],
            destinationCoords: null,
            error: null,
            routeResponse: null,
            lockingForDriver: false,
            driverIsOnTheWay: false,
            driverLocation: null
        };

    }

    getUserLocation = () => {
      this.watchId =   Geolocation.watchPosition(
            position => {
                this.setState(prevState => ({
                    ...prevState,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }))
            }, error => this.setState(prevState => ({
                ...prevState,
                error: error.message
            })),
            { enableHighAccuracy: true, timeout: 1000000, maximumAge: 10000000 }
        )
    }

    handlePredictionPress = async place_id => {

        try {

            const url = `${BASE_URL}/directions/json?key=${API_KEY}&destination=place_id:${place_id}&origin=${this.state.latitude},${this.state.longitude}`
            const points = await getRoute(url);
            const coordinates = decodePoint(points);

            const {
                data
            } = await axios.get(url);

            this.setState(prevState => ({
                ...prevState,
                coordinates,
                destinationCoords: coordinates[coordinates.length - 1],
                routeResponse: data
            }));

            this.ref.fitToCoordinates(coordinates, {
                animated: true,
                edgePadding:{
                    top:20,
                    bottom:20,
                    left:20,
                    right:20
                }
            });
            //  setTap(true)
        } catch (error) {
            console.error('error prediction press', error)
        }
    }

    async requestDriver() {
        this.setState(prevState => ({
            ...prevState,
            lockingForDriver: true
        }))
        const socket = SocketIO.connect("http://192.168.2.15:3000");

        socket.on("connect", () => {
            console.log("CLient connected");
            socket.emit("taxiRequest", this.state.routeResponse)
        })

        socket.on("driverLocation", (driverCoordinate) => {

            const pointsCoords = [...this.state.coordinates,driverCoordinate]

            this.ref.fitToCoordinates(pointsCoords, {
                animated: true,
                edgePadding:{
                    top:20,
                    bottom:20,
                    left:20,
                    right:20
                }
            });

            this.setState(prevState => ({
                ...prevState,
                lockingForDriver: false,
                driverIsOnTheWay: true,
                driverLocation: driverCoordinate
            }));

        })

    }

    componentDidMount() {
        this.getUserLocation();
    }

    componentWillUnmount(){
        Geolocation.clearWatch(this.watchId)
    }

    render() {
        const { latitude, longitude, coordinates, destinationCoords, driverIsOnTheWay, driverLocation } = this.state;

        let driverMarker = null;

      //  if (driverLocation) {
            driverMarker = (<Marker coordinate={driverLocation}>
                <Image source={car} style={{ width: 60, height: 60 }} />
            </Marker>)
      //  }

        if (!latitude || !longitude) {
            return (
                <View style={styles.container}>
                    <ActivityIndicator size='large' />
                </View>
            )
        }

        return (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.container}>
                    <MapView
                        ref={(mapView) => this.ref = mapView}
                        style={styles.map}
                        initialRegion={{
                            latitude: latitude,
                            longitude: longitude,
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.0121,
                        }}
                        showsUserLocation={true}
                    >
                        {coordinates.length > 0 && (
                            <Polyline
                                coordinates={coordinates} strokeWidth={6} strokeColor="#0E70D1" />
                        )}
                        {destinationCoords && (<View>
                            <Marker
                                 coordinate={destinationCoords} />
                            {driverMarker}
                        </View>)}

                        <MapViewDirections
                            origin={coordinates[0]}
                            destination={destinationCoords}
                            apikey={API_KEY}
                            strokeWidth={3}
                            strokeColor="hotpink"
                            onStart={params => {
                                console.log(
                                    `Started routing between "${params.origin}" and "${params.destination
                                    }"`
                                );
                            }}
                            onReady={result => {
                                console.log(`Distance: ${result.distance} km`)
                                console.log(`Duration: ${result.duration} min.`)
                            }}
                        />
                    </MapView>
                    <PlaceInput latitude={latitude} longitude={longitude} onPredictionPress={this.handlePredictionPress} />
                    {destinationCoords &&
                        (<TouchableOpacity style={{
                            backgroundColor: 'black',
                            justifyContent: 'center', marginTop: 'auto', margin: 20,
                            padding: 15, paddingLeft: 30, paddingRight: 30, alignSelf: 'center'
                        }} onPress={() =>
                            this.requestDriver()
                        }>

                            <Text style={{ color: 'white' }}>FIND DRIVER</Text>
                            {this.state.lockingForDriver && (<ActivityIndicator animating={this.state.lockingForDriver} size="large" />)}
                        </TouchableOpacity>)
                    }


                </View>

            </TouchableWithoutFeedback>
        )
    }

}


const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: height,
        width: width,
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