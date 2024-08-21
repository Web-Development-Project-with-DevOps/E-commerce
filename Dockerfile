FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt requirements.txt .
RUN apt update -y && apt upgrade -y
RUN apt install python3 -y
RUN apt install pip -y
RUN apt-get update && apt-get install -y git
RUN git clone https://github.com/Web-Development-Project-with-DevOps/E-commerce.git
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
