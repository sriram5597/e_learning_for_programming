import { useState } from 'react'

const useForm = (inputs) => {
    const [state, setState] = useState(inputs);
    const handleChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value,
        });
    }

    return [state, handleChange];
}

export default useForm;