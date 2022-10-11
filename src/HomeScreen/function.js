import axios from "axios";
import GetLocation from 'react-native-get-location'

export const postPhotos = (image, longitude, latitude) => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = 'https://reqres.in/api/photos';
      const formData = new FormData();

      formData.append("image", image);

      const result = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: {
          longitude,
          latitude
        }
      })

      resolve(result)
    } catch (error) {
      resolve(false)
      console.log('error@postPhotos.function.js', error);
    }
  })
}

export const getCurrentLocation = (image) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      })

      resolve(result)
    } catch (error) {
      resolve(false)
      console.log('error@getCurrentLocation.function.js', error);
    }
  })
}