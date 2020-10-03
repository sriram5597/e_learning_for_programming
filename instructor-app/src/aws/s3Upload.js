import AWS from 'aws-sdk';

const BUCKET_NAME = 'coursevidehlsstream-dev-input-4t2nnryr'

export const multipartFileUpload = async (file, credentials, status, key) => {
    const { setPercent,  setError, setCompleted } = status;

    try{
        const s3 = new AWS.S3({
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
        });

        const reader = new FileReader();

        reader.onload = (e) => {
            const buffer = e.target.result;
            const CHUNK_SIZE = 5 * 1024 * 1024;
            const total = Math.ceil(buffer.byteLength / CHUNK_SIZE);

            let chunks = [];
            let start = 0, end = CHUNK_SIZE;

            let count = 0;
            while(count < total){
                const chunk = buffer.slice(start, end);
                
                chunks = [...chunks, chunk];

                start = end;
                if(end + CHUNK_SIZE >= buffer.byteLength){
                    end = buffer.byteLength;
                }
                else{
                    end += CHUNK_SIZE;
                }
                count++;
            }

            const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                ContentDisposition: 'attachment',
                ACL: 'private',
            }

            s3.createMultipartUpload(params, async (err, data) => {
                if(err){
                    console.log(err.response.data);
                    return;
                }

                let ETags = [];
                const { UploadId } = data;
                let part = 1;
                
                let i = 0;
                let uploaded = 0;
                while(i < total){
                    const upParams = {
                        Bucket: BUCKET_NAME,
                        Key: key,
                        UploadId,
                        PartNumber: part,
                        Body: chunks[i],
                    }

                    const upRes = await s3.uploadPart(upParams).promise();
                    const temp = {
                        ETag: upRes.ETag,
                        PartNumber: part,
                    }

                    ETags = [...ETags, temp];

                    console.log(ETags);
                    uploaded += chunks[i].byteLength;
                    
                    setPercent(Math.floor(uploaded / buffer.byteLength * 100));
                    part++;
                    i++;
                }
                
                const completeParams = {
                    Bucket: BUCKET_NAME,
                    Key: key,
                    MultipartUpload: {
                        Parts: ETags
                    },
                    UploadId
                }
                s3.completeMultipartUpload(completeParams, (err, data) => {
                    if(err){
                        setError(err);
                        return;
                    }
                    setCompleted(true);
                });
            });
        }

        reader.readAsArrayBuffer(file);     
    }
    catch(err){
        setError(err);
    }
}

export const uploadFile = async (file, cred, bucket, key) => {
    try{
        const credentials = cred;
        console.log(credentials);
        const s3 = new AWS.S3({
            accessKeyId: credentials.AccessKeyId,
            secretAccessKey: credentials.SecretAccessKey,
            sessionToken: credentials.SessionToken,
        });

        const reader = new FileReader();

        reader.onload = () => {
            const params = {
                Bucket: bucket, 
                Key: key,
                Body: fileContent
            }
    
            s3.upload(params, (err, data) => {
                if(err){
                    throw err;
                }
                return data;
            });
        }

        reader.readAsArrayBuffer(file);
    }
    catch(err){
        console.log(err);
    }
}