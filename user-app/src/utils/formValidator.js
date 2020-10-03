const formValidator = (state) => {
    let error = {};

    for(let field in state){
        if(state[field].trim() === ""){
            error[field] = `${field} cannot be empty`;
        }    
    }
    return error;
}

export default formValidator;