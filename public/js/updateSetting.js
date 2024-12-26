/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';

export const updateUserSetting = async (data, type) => {
    try {

        const urlEndpoint = type === 'data'? 'updateMe' : 'updateMyPassword';

        const res = await axios({
            method: 'PATCH',
            url: `http://localhost:8000/api/v1/users/${urlEndpoint}`,
            data
        });
        
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Updated Successfully`);
            window.setTimeout(() => {
                location.assign('/me');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
