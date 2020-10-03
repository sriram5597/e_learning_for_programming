import React, { useState, useEffect } from 'react';

//s3 upload
import { multipartFileUpload } from '../../../../aws/s3Upload';

//graphql
import { useMutation } from '@apollo/react-hooks';
import { ADD_SOURCE } from '../../../../graphql/mutation/courseFlowMutations';

//utils
import TipButton from '../../../../utils/TipButton';

//mui
import { Button, Typography, CircularProgress, TextField, Paper } from '@material-ui/core';

//mui/styles
import { makeStyles } from '@material-ui/styles';

//mui/icons
import { CloudUploadOutlined, CheckCircle, Cancel } from '@material-ui/icons';

const useStyles = makeStyles( (theme) => ({
  form: {
      width: '90%',
      margin: 10,
      flexWrap: 'wrap'
  }, 

  select: {
      position: 'relative',
      width: '20%',
      margin: 30,
  },

  text: {
      position: 'relative',
      width: '20%',
      margin: 30,
  },

  upload: {
    position: 'relative',
    backgroundColor: '#ffffff',
    padding: 20,
    width: '60%',
    left: '20%',
    height: 450,
    boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.5)'

  },

  iconButton: {
    position: 'relative',
    marginLeft: 150,
  },

  icon: {
    fontSize: 120,
  },

  fileText:{
    position: 'absolute',
    left: '50%',
    top: '20%',
  },

  uploadArea: {
    position: 'absolute',
    width: '50%',
    height: 200,
    left: "20%",
    padding: 20,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.5)'
  },

  uploadText: {
    position: 'relative',
    left: '20%',
  },

  success: {
    position: 'relative',
    left: '40%',
    fontSize: 120,
    color: theme.palette.success.main,
  },

  error: {
    position: 'relative',
    left: '40%',
    fontSize: 120,
    color: theme.palette.alert.main,
  },

  percent: {
    position: 'absolute',
    left: '40%',
    fontSize: 45,
    marginTop: '9%',
  },

  progress: {
    position: 'absolute',
    left: '35%', 
    marginTop: 8,
    zIndex: 2,
  },

  uploadButton: {
    position: 'absolute',
    top: '65%',
    left: '40%',
  },

  status: {
    position: 'absolute',
    left: '35%',
    top: '65%',
  },

  successText: {
    position: 'absolute',
    fontSize: 25,
    left: "30%",
    color: theme.palette.success.main,
  },

  errorText: {
    position: 'absolute',
    fontSize: 25,
    left: "30%",
    color: theme.palette.alert.main,
  },

  formErr:{
    color: theme.palette.alert.main,
  }
}));

const VideoUpload = (props) => {
  const classes = useStyles();

  const { course_id, title } = props;

  const [file, setFile] = useState();
  const [percent, setPercent] = useState(0);
  const [data, setData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [formErr, setFormErr] = useState("");

  const [uploadVideo, { loading }] = useMutation(ADD_SOURCE, {
    onError: (err) => {
      console.log(err);
    },
    onCompleted: (data) => {
        const key = `${data.addSource.key.split('/')[0]}.${file.name.split('.')[1]}`;
        multipartFileUpload(file, data.addSource.credentials, { setError, setPercent, setCompleted }, key);
    },
    update: (cache, { data }) => {
      props.updateAfterMutation(cache, data['addSource'].flow);
    }
  })

  useEffect(() => {
    if(status.name === 'addSource' && status.status === 'ERROR'){
      setError(status.message);
    }
  }, [status]);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    if(e.target.files[0].name.split('.')[1] !== 'mp4'){
      setFormErr('Invalid File Format')
    }
    else{
      setFormErr("");
    }
  }

  const handleChange = (e) => {
    setData({
        ...data,
        [e.target.name]: e.target.value
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const variables = {
      course_id,
      title,
      source: {
        type: "VIDEO",
        source_title: data.source_title
      }
    }

    uploadVideo({
      variables: {
        ...variables
      }
    });

    setUploading(true);
  }
  
  const handleUpload = () => {
    document.getElementById('file-upload').click();
  }

  const handleRetry = () => {
    setError("");
    setUploading(false);
  }

  return (
    <div className={classes.form}>
        <span>
            <TextField label="Enter Source Title" variant='outlined' onChange={handleChange} className={classes.text} 
                    name="source_title" color='primary' 
            />
        </span>

        <Paper className={classes.upload}>
          {
            uploading && !completed && !error ? (
                !percent || percent >= 100 ? (
                  <CircularProgress size={190} className={classes.progress} color='primary' thickness={2} />
              ) : (
                  <CircularProgress variant='determinate' value={percent} size={190} className={classes.progress} color='primary' thickness={2} />
              ) ) : (
                null
              )
          }
          
          <div>
            {
              uploading && !completed && !error ? (
                  <Typography variant='h1' className={classes.percent}>
                    <strong>
                      {percent}%
                    </strong>
                  </Typography>
              ) : (
                completed ? (
                  <div>
                    <CheckCircle className={classes.success} />
                    <Typography variant='h1' className={classes.successText}>
                      <strong>
                        Uploaded Successfully
                      </strong>
                    </Typography>
                  </div>
                ) : (
                  error ? (
                    <div>
                      <Cancel className={classes.error} />
                      <Typography variant='h1' className={classes.errorText}>
                        <strong>
                          {error}
                        </strong>
                      </Typography>
                    </div>
                  ) : (
                    <div className={classes.uploadArea}>
                      <input type="file" onChange={handleFile} hidden={true} id="file-upload"/> <br/> <br/>
                      <TipButton tip="Upload File" btnColor='primary' onClick={handleUpload} className={classes.iconButton}>
                        <CloudUploadOutlined color='primary' className={classes.icon} />
                      </TipButton>
                      {
                        file && (
                          <Typography variant='h6' className={classes.fileText}>
                            Selected File: <br/>
                            <strong>{file.name}</strong>
                          </Typography>
                        )
                      }
                      <Typography variant='subtitle2' className={classes.uploadText}>
                        <strong>
                          Click here to Upload file
                        </strong>
                      </Typography>
                    </div>
                  )
                )
              )
            }
          </div>
          <div className={classes.uploadButton}>
            <Typography variant='h6' color='secondary' className={classes.formErr}>
              <strong>
                {formErr}  
              </strong>
            </Typography>
            <Button color='primary' variant='contained' disabled={!file || formErr || uploading ? true : false} onClick={handleSubmit}>
              Upload
            </Button>
            {
              error && (
                <Button color='primary' variant='outlined' onClick={handleRetry}>
                  Retry 
                </Button>
              )
            }
          </div>
        </Paper>
    </div>
  )
}

export default VideoUpload;