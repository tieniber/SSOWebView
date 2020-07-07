import { Component, createElement } from "react";
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-community/async-storage';

export class SsoWebView extends Component {
    state = {
        loaded: false,
        tokenRetrieved: false
    }

    onChange(response){
        if(this.props.url){
            this.props.url.setTextValue(response.url);
        }
        if(response.url.indexOf(mx.remoteUrl) == 0 && response.url.indexOf("SSO") == -1){
            if(!this.state.loaded){
                this.setState({loaded: true});
            }
        }
    }

    _storeToken = async (token) => {
        try {
          await AsyncStorage.setItem('token', token);
        } catch (error) {
            alert(error);
          // Error saving data
        }
      };

    onComplete(event){
        //make sure only once
        if(!this.state.tokenRetrieved){
            this.setState({tokenRetrieved: true});
        }else{
            return;
        }
        const cookieString = event.nativeEvent.data;
        const token = new RegExp('AUTH_TOKEN=([^;]+)', 'g').exec(cookieString);
        this._storeToken(token[1]);
        mx.reload();

    }

    render() {
        const url = mx.remoteUrl + "SSO/"
        if(this.props.url){
            this.props.url.setTextValue(url);
        }
        return (<WebView
            source={{uri: url}}
            style={{height: '100%'}}
            hideKeyboardAccessoryView={true}
            injectedJavaScript={ (this.state.loaded ? 'window.ReactNativeWebView.postMessage(document.cookie)' : null )}
            onMessage={(event)=> this.onComplete(event)}
            onNavigationStateChange={(response) => this.onChange(response)}
        />)
    }
}
