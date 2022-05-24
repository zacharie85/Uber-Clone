import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { StyleSheet, View, Keyboard, Dimensions, ActivityIndicator, TouchableWithoutFeedback, TouchableOpacity, Text, Linking, Platform, Alert } from 'react-native';
import React, { Component } from 'react';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import PlaceInput from '@components/PlaceInput';
import SocketIO from 'socket.io-client';
import { BASE_URL, API_KEY, prefix, getRoute, decodePoint } from '../utiles/Helpers'
import MapViewDirections from 'react-native-maps-directions';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

const { width, height } = Dimensions.get('window');

export default class Driver extends Component {

    constructor(props) {
        super(props);

        this.state = {
            latitude: null,
            longitude: null,
            coordinates: [],
            destinationCoords: null,
            error: null,
            lockingForpassenger: false,
            bottomText: "FIND PASSENGER",
        };

        this.acceptPassengerRequest = this.acceptPassengerRequest.bind(this);
        this.lockForPassenger = this.lockForPassenger.bind(this);

        this.socket = null;
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
        this.watchId = Geolocation.watchPosition(
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
        this.socket = SocketIO.connect("http://192.168.0.148:3000");

        this.socket.on("connect", () => {
            console.log("Driver connected");
            this.socket.emit("lockingForPassenger")
        })

        this.socket.on("taxiRequest", routeResponse => {
            console.log(routeResponse);
            // socket.emit("lockingForPassenger")

            if (routeResponse != null) {
                this.setState(prevState => ({
                    ...prevState,
                    lockingForpassenger: false,
                    bottomText: "PASSENGER FOUND! ACCEPT RIDE ?"
                }))
                this.handlePredictionPress(routeResponse.geocoded_waypoints[0].place_id)
            }


        })
    }

    acceptPassengerRequest() {
        // Send driver location to passenger

        BackgroundGeolocation.on('location', (location) => {
            this.socket.emit("driverLocation", { latitude: location.latitude, longitude: location.longitude });
        });

        BackgroundGeolocation.checkStatus(status => {
            console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
            console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
            console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

            // you don't need to check status before start (this is just the example)
            if (!status.isRunning) {
                BackgroundGeolocation.start(); //triggers start on start event
            }

        });


        const passengerCoords = this.state.coordinates[this.state.coordinates.length - 1];

        if (Platform.OS == 'ios') {
            Linking.openURL(`http://maps.apple.com/?daddr=${passengerCoords.latitude},${passengerCoords.longitude}`)
        } else {
            //Linking.openURL(`google.navigation:q=${passengerCoords.latitude}+${passengerCoords.longitude}`)
        }
    }

    componentDidMount() {
        this.getUserLocation();

        BackgroundGeolocation.configure({
            desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
            stationaryRadius: 50,
            distanceFilter: 50,
            debug: false,
            startOnBoot: false,
            stopOnTerminate: true,
            locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
            interval: 10000,
            fastestInterval: 5000,
            activitiesInterval: 10000,
            stopOnStillActivity: false
        });

        BackgroundGeolocation.on('error', (error) => {
            console.log('[ERROR] BackgroundGeolocation error:', error);
        });

        BackgroundGeolocation.on('start', () => {
            console.log('[INFO] BackgroundGeolocation service has been started');
        });

        BackgroundGeolocation.on('stop', () => {
            console.log('[INFO] BackgroundGeolocation service has been stopped');
        });

        /*          BackgroundGeolocation.on('authorization', (status) => {
                   console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
                   if (status !== BackgroundGeolocation.AUTHORIZED) {
                     // we need to set delay or otherwise alert may not be shown
                     setTimeout(() =>
                       Alert.alert('App requires location tracking permission', 'Would you like to open app settings?', [
                         { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                         { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                       ]), 1000);
                   }
                 }); */

        BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
        });

        BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
        });

        BackgroundGeolocation.on('abort_requested', () => {
            console.log('[INFO] Server responded with 285 Updates Not Required');

            // Here we can decide whether we want stop the updates or not.
            // If you've configured the server to return 285, then it means the server does not require further update.
            // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
            // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
        });

        BackgroundGeolocation.on('http_authorization', () => {
            console.log('[INFO] App needs to authorize the http requests');
        });

    };

    componentWillUnmount() {
        Geolocation.clearWatch(this.watchId)
    };

    render() {
        const { latitude, longitude, coordinates, destinationCoords, lockingForpassenger, bottomText } = this.state;

        let bottomButtomFunction = this.lockForPassenger;

        if (bottomText == "PASSENGER FOUND! ACCEPT RIDE ?") {
            bottomButtomFunction = this.acceptPassengerRequest;
        }
        if (latitude == null || longitude == null) {
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
                    }} onPress={bottomButtomFunction}>
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