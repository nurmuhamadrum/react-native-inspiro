import React, { Component } from 'react';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
  ActivityIndicator
} from 'react-native';
import styles from './style';
import { postPhotos, getCurrentLocation } from './function';

class HomeScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAADdCAMAAACc/C7aAAAAaVBMVEXDw8MAAADGxsaXl5fJycnMzMxSUlKRkZF1dXV5eXnCwsIFBQWlpaV+fn66urqurq5dXV1sbGxMTEyKiopXV1czMzOcnJwaGhqoqKiEhIQlJSUrKysODg5mZmZHR0ezs7M7OzsVFRU5OTmFwHepAAAC+klEQVR4nO3bi1KjMBSAYXIarIbea2uttVXf/yE36Q0qobrITHP0/2Z2Zt2xDP+GQEDMMgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANQ56dCtY+JcZge9zgzsrXvipGc61EtzLO29KbpKLMx9mkPpI83H410XFiblyGFufy7Ph0lHPnSya/aByFuqRv7sSqchUvwV83k4EHFtt6QhcrwOl4GXZdv9VBApq3CdK/w1c9nykNUQ+XK6pG/abin5SFmWy5Z+u6FMP7K6unttt6cKIqflSE4a9tQd/zRtKflI6ZeRw6Y9deFS2ryl5COzUXkzMWoIcZm45bixUkGkfd6PormyyBMZPxkzaVouKIjM7PAwjtPm/XRP4Rse8/hgaoh0djzdbl9XeePJxc7CUBdmHi/REOkPx3Bb2DTlnOwP6L34vNQReZ3szqffRXRa/oJIcetzpJnksS2pj3T5pPrIqmfr6wL9kbZvynWf/8uuPi21Rzrxa4WijCzMW/0j6iKdV/lSZPH5Ges0V3+4flqi+uV77Ql07QmCtkg7GlcumM4uI0/ZC+UjGe67FpVl+qhWGGw/f0pRpIS99aeWjTtV2rdopBleTktNkZkMwvmzMHf20BCaY42FWV3MXFWR2eZY8ezvpY/N8aF8UhuZz84jtV+Iu/d4YfiGu+oHFUX6e43i1LDODs1FfCT9P8+lXN7piZRxNWOS23nTOB7syvsRPZHZ+qKhv2uckMfBLqelmsjLew1/anlpOlbLwT5vSUeks/2rQVG9U5eSyLC0+f+3JE53XToiRT6+OjhjPjRFunz6dVHM9DAtVURG7zW+ZbAfSw2R0mpCHvi1vFMRabctC/1/zdaKisjTTwnaRIYfhCmIdHbQunF/Rl5J8pEizfca37Pxkzr5yNnXHdfNJPGRHNrRvP9D81HqkbnNO5D2W5K//X1XFyK7kuyby3/iHXTp8rcJVmk2/onfCwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALi1f4DsKck70eEzAAAAAElFTkSuQmCC',
      isLoadingSubmit: false,
      isLoadingLocation: false,
      longitude: '-',
      latitude: '-'
    }
  }

  /** Handler launch camera */
  _handlerLaunchCamera = async () => {
    const option = {
      mediaType: 'photo',
      quality: 1
    }

    /** Android Permission */
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "App Camera Permission",
        message: "App needs access to your camera",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Camera permission given");

      launchCamera(option, (res) => {
        if (res.didCancel) {
          console.log('Cancel take photos');
        } else if (res.errorCode) {
          console.log('Error take photos', res.errorMessage);
        } else {
          const data = res.assets;
          this.setState({ fileUri: data[0].uri })

          console.log('Success take photo', data);
        }
      });
    } else {
      console.log("Camera permission denied");
    }
  }

  /** Handler launch image library */
  _handlerLaunchImageLibrary = () => {
    const option = {
      mediaType: 'photo',
      quality: 1
    }

    launchImageLibrary(option, (res) => {
      if (res.didCancel) {
        console.log('Cancel pick photos');
      } else if (res.errorCode) {
        console.log('Error pick photos', res.errorMessage);
      } else {
        const data = res.assets;
        this.setState({ fileUri: data[0].uri })

        console.log('Success pick photo', data);
      }
    });
  }

  /** Handler submit photos */
  _handlerSubmitPhotos = async () => {
    try {
      const { fileUri, longitude, latitude } = this.state;
      this.setState({ isLoadingSubmit: true })

      const result = await postPhotos(fileUri, longitude, latitude)

      if (result.data) {
        Alert.alert('Success Submit Photos')
        this.setState({ isLoadingSubmit: false })
      } else {
        Alert.alert('Failed Submit Photos')
        this.setState({ isLoadingSubmit: false })
      }
    } catch (error) {
      console.log('error@_handlerSubmitPhotos.index.HomeScreen', error);
    }
  }

  /** Handler Get Current Location */
  _handlerGetCurrentLocation = async () => {
    try {
      this.setState({ isLoadingLocation: true })
      /** Android Permission */
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Location Permission',
          'message': 'This App needs access to your location ' +
            'so we can know where you are.'
        }
      )

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const result = await getCurrentLocation()

        if (result.latitude && result.longitude) {
          this.setState({ 
            longitude: result.longitude,
            latitude: result.latitude,
            isLoadingLocation: false 
          })

          Alert.alert('Success Get Location')
        } else {
          this.setState({ isLoadingLocation: false })
          Alert.alert('Failed Get Location')
        }
        
      } else {
        console.log("Location permission denied")
      }

    } catch (error) {
      console.log('error@_handlerGetCurrentLocation', error);
    }
  }

  render() {
    const { fileUri, isLoadingSubmit, latitude, longitude, isLoadingLocation } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.homeContainer}>
            <Image style={styles.imageStyle} source={{ uri: fileUri }} />

            <View style={styles.locationContainer}>
              <Text style={styles.titleLocation}>{`Longitude : ${longitude}`}</Text>
              <Text style={styles.titleLocation}>{`Latitude : ${latitude}`}</Text>
            </View>

            {/** Button Uploads Photos */}
            <TouchableOpacity style={styles.button} onPress={() => this._handlerLaunchImageLibrary()}>
              <Text>Upload Photos</Text>
            </TouchableOpacity>
            {/** Button Take Photos */}
            <TouchableOpacity style={styles.buttonSecond} onPress={() => this._handlerLaunchCamera()}>
              <Text>Take Photos</Text>
            </TouchableOpacity>
            {/** Button Get Location */}
            <TouchableOpacity style={styles.buttonSecond} onPress={() => this._handlerGetCurrentLocation()}>
              {isLoadingLocation ? (
                <ActivityIndicator />
              ) : (
                <Text>Get Location</Text>
              )}
            </TouchableOpacity>
            {/** Button Submit Photos */}
            <TouchableOpacity style={styles.buttonThird} onPress={() => this._handlerSubmitPhotos()}>
              {isLoadingSubmit ? (
                <ActivityIndicator />
              ) : (
                <Text>Submit</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }
}

export default HomeScreen;