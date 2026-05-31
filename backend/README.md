# SkyMind AI Backend

This backend serves the SkyMind AI frontend with live flight analytics and real delay predictions.

Main files:

- [main.py](</C:/Users/9esun/OneDrive/Desktop/skymind ai/backend/main.py>)
- [data_generator.py](</C:/Users/9esun/OneDrive/Desktop/skymind ai/backend/data_generator.py>)
- [model.py](</C:/Users/9esun/OneDrive/Desktop/skymind ai/backend/model.py>)
- [routes/predict.py](</C:/Users/9esun/OneDrive/Desktop/skymind ai/backend/routes/predict.py>)
- [routes/analytics.py](</C:/Users/9esun/OneDrive/Desktop/skymind ai/backend/routes/analytics.py>)
- [routes/flights.py](</C:/Users/9esun/OneDrive/Desktop/skymind ai/backend/routes/flights.py>)

Run locally:

```powershell
cd "C:\Users\9esun\OneDrive\Desktop\skymind ai\backend"
py -3.12 -m pip install --user -r requirements.txt
py -3.12 -m uvicorn main:app --host 127.0.0.1 --port 8000
```
