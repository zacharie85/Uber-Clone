import MapView, { PROVIDER_GOOGLE, Marker,Polyline } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import { StyleSheet, View, TextInput, Keyboard, Dimensions,ActivityIndicator,TouchableWithoutFeedback } from 'react-native';
import React, { Component } from 'react';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import PlaceInput from '@components/PlaceInput';

import { BASE_URL, API_KEY, prefix, getRoute, decodePoint } from '../utiles/Helpers'
import MapViewDirections from 'react-native-maps-directions';

const initialState = {
    latitude: 0,
    longitude: 0,
    coordinates: [],
    destinationCoords: null,
    error: null
};
const { width, height } = Dimensions.get('window');

export default function Map(props, { navigation }) {

    const mapView = React.useRef();
    const [state, setState] = React.useState(initialState);
    const [tap, setTap] = React.useState(false)
    const { latitude, longitude, coordinates, destinationCoords } = state;
    const [distance, setDistance] = React.useState(0.0);
    const [minute, setMinute] = React.useState(0.0);

    const getUserLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                setState(prevState => ({
                    ...prevState,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }))
            }, error => setState(prevState => ({
                ...prevState,
                error: error.message
            })),
            { enableHighAccuracy: true, timeout: 1000000, maximumAge: 10000000 }
        )
    }

    React.useEffect(() => {
        getUserLocation();
    }, []);

    const handlePredictionPress = async place_id => {

        try {
            const url = `${BASE_URL}/directions/json?key=${API_KEY}&destination=place_id:${place_id}&origin=${latitude},${longitude}`
            const points = await getRoute(url);
            const coordinates = decodePoint(points)
            setState(prevState => ({
                ...prevState,
                coordinates,
                destinationCoords: coordinates[coordinates.length - 1]
            }));

            mapView?.current?.fitToCoordinates(coordinates,100000, {
                animated: true,
            });
            setTap(true)
        } catch (error) {
            console.error('error prediction press', error)
        }
    }

    if (!latitude || !longitude) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size='large' />
            </View>
        )

    }

    return (
        <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
        <View style={styles.container}>
            <MapView
                ref={mapView}
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
                        setDistance(Math.ceil(result.distance));
                        setMinute(Math.ceil(result.duration));
                        console.log(`Distance: ${result.distance} km`)
                        console.log(`Duration: ${result.duration} min.`)
                    }}
                />
            </MapView>
            <PlaceInput latitude={latitude} longitude={longitude} onPredictionPress={handlePredictionPress} />

        </View>
        </TouchableWithoutFeedback>
    )
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