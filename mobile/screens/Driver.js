import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { StyleSheet, View, Keyboard, Dimensions, ActivityIndicator, TouchableWithoutFeedback, TouchableOpacity, Text } from 'react-native';
import React, { Component } from 'react';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import PlaceInput from '@components/PlaceInput';
import SocketIO from 'socket.io-client';
import { BASE_URL, API_KEY, prefix, getRoute, decodePoint } from '../utiles/Helpers'
import MapViewDirections from 'react-native-maps-directions';

const { width, height } = Dimensions.get('window');

export default class Driver extends Component {

    constructor(props) {
        super(props);

        this.state = {
            latitude: 0,
            longitude: 0,
            coordinates: [],
            destinationCoords: null,
            error: null,
            lockingForpassenger: false,
            bottomText: "FIND PASSENGER"
        };

        // this.onChangeDestinationDebounced = _.debounce(this.handlePredictionPress,1000)
    }

    /* const mapView = React.useRef();
    const [state, setState] = React.useState(initialState);
    const [tap, setTap] = React.useState(false)
    const { latitude, longitude, coordinates, destinationCoords } = state;
    const [distance, setDistance] = React.useState(0.0);
    const [minute, setMinute] = React.useState(0.0); */
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

            this.ref.fitToCoordinates(coordinates, 100000, {
                animated: true,
            });

        } catch (error) {
            console.error('error prediction press', error)
        }
    }

    getUserLocation = () => {
        Geolocation.getCurrentPosition(
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

    async lockForPassenger() {
        this.setState(prevState => ({
            ...prevState,
            lockingForpassenger: true,
            bottomText: "FIND PASSENGER"
        }))
        const socket = SocketIO.connect("http://192.168.2.16:3000");

        socket.on("connect", () => {
            console.log("Driver connected");
            socket.emit("lockingForPassenger")
        })

        socket.on("taxiRequest", routeResponse => {
            console.log(routeResponse);
            // socket.emit("lockingForPassenger")

            if (routeResponse != null) {
                this.setState(prevState => ({
                    ...prevState,
                    lockingForpassenger: false,
                    bottomText: "PASSENGER FOUND"
                }))
                this.handlePredictionPress(routeResponse.geocoded_waypoints[0].place_id)
            }
        
           
        })
    }

    componentDidMount() {
        this.getUserLocation();
    }
    render() {
        const { latitude, longitude, coordinates, destinationCoords } = this.state;
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
                        region={{
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
                            <Marker coordinate={destinationCoords} />

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
                    <TouchableOpacity style={{
                        backgroundColor: 'black',
                        justifyContent: 'center', marginTop: 'auto', margin: 20,
                        padding: 15, paddingLeft: 30, paddingRight: 30, alignSelf: 'center'
                    }} onPress={() =>
                        this.lockForPassenger()
                    }>

                        <Text style={{ color: 'white' }}>{this.state.bottomText}</Text>
                        {this.state.lockingForpassenger && (<ActivityIndicator animating={this.state.lockingForpassenger} size="large" />)}

                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
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