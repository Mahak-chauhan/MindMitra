exports.getPrediction = async (checkInData, target = 'felt_rested') => {
    const fastapiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
    
    const payload = {
        target: target,
        ...checkInData
    };
    
    try {
        const response = await fetch(fastapiUrl + '/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            let errorDetail = "FastAPI error: " + response.statusText;
            try {
                const errorBody = await response.json();
                if (errorBody.detail) {
                    errorDetail = Array.isArray(errorBody.detail) ? errorBody.detail[0].type : errorBody.detail;
                }
            } catch(e) {}
            throw new Error(errorDetail);
        }
        
        return await response.json();
    } catch (error) {
        console.error("ML Service Error:", error);
        throw error;
    }
};
