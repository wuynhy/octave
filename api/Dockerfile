FROM python:3.9-bullseye
RUN python -m pip install --upgrade pip
WORKDIR /app
COPY requirements.txt requirements.txt
COPY main.py main.py
COPY authenticator.py authenticator.py
COPY routers routers
COPY queries queries
RUN python -m pip install -r requirements.txt
COPY migrations migrations
CMD python -m migrations up && uvicorn main:app --host 0.0.0.0
