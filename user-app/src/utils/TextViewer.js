import axios from 'axios';

export default (url) => {
    const headers = {
        'CROSS-CONTORL-ALLOW-ORIGIN': 'https://stacle-courses.s3.amazonaws.com',
    }

    axios.get(url, headers ).then( (res) => {
        const file_url = window.URL.createObjectURL(new Blob([res.data]));
        const reader = new FileReader();

        console.log(reader.readAsText(file_url));
    });
}