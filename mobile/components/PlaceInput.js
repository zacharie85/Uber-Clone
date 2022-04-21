import React,{useState} from "react";
import {View,StyleSheet,TextInput,Dimensions,ActivityIndicator,Keyboard} from "react-native";
import {prefix,BASE_URL,API_KEY} from "./Helpers"
import axios from 'axios';
import Prediction from "./Prediction";
const {width,height} = Dimensions.get("window");

const initialState = {
    place: "",
    predictions:[],
    loading:false,
}

const PlaceInput =({latitude,longitude,onPredictionPress,style}) =>{

    const [state,setState] = useState(initialState)
    const {container,icon,input,inputContainer} = styles;
    const {place,loading,predictions} = state;

    const renderPredictions = () =>{
        return predictions.map(prediction =>{
            const {structured_formatting,id,place_id} = prediction;
            return(
                <Prediction
                    main_text={structured_formatting.main_text}
                    secondary_text = {structured_formatting.secondary_text}
                    key={place_id}
                    onPress={() =>{
                        onPredictionPress(place_id)
                        setState(prevState =>({
                            ...prevState,
                            predictions:[],
                            place:structured_formatting.main_text
                            
                          }))
                          Keyboard.dismiss()
                    }}
                />
            )
        })
    }

    const search = async(url) =>{
        try {
            const { 
                data : {predictions}
            } = await axios.get(url);
            setState(prevState =>({
                ...prevState,
                predictions,
                loading:false
            }))
        } catch (e) {
            console.error('error search',e);
        }
    }
    const handleChangeText = value =>{
        setState( prevState =>({
            ...prevState,
            place:value,
            loading:true
        }))

        const url =`${BASE_URL}/place/autocomplete/json?key=${API_KEY}&input=${value}&location=${latitude},${longitude}&radius=2000&language=fr`; // construire l'url de la place
        search(url);
        console.log("url",url);
        
    }
    return(
        <View style={container}>
             <View style={inputContainer}> 
                <TextInput style={input} value={place} onChangeText={handleChangeText} placeholder = 'Enter a location...'/>
                {loading && <ActivityIndicator color={'black'}/>}                
            </View> 
            {!loading && predictions.length > 0 ? renderPredictions():null}
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
    position:"absolute",
    marginTop:50,
    borderRadius:8,
    paddingHorizontal:10,
    width:width - 50,
    backgroundColor:"#fff",
    shadowColor:"#000",
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.25,
    shadowRadius:3.84,
    elevation:5,
    marginLeft:15
    },
    icon:{
        fontSize:25,
        color:"#d6d6d6"
    },
    input:{
        fontSize:16,
        color:"#303030",
        maxWidth:"70%",
        minWidth:"30%",
    },
    inputContainer:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        padding:10,
    }
})
export default PlaceInput;