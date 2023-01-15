import axios from 'axios';

function axiosSetup() {
    // https://stackoverflow.com/questions/50732815/how-to-use-csrf-token-in-django-restful-api-and-react
    // https://docs.djangoproject.com/en/3.0/ref/csrf/
    // https://www.techiediaries.com/django-react-forms-csrf-axios/
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
}

export default axiosSetup;
