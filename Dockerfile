FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update -y && apt-get install -y git
RUN git clone https://github.com/Web-Development-Project-with-DevOps/E-commerce.git
WORKDIR /app/E-commerce/Backend
ENV PATH="/usr/local/bin:$PATH"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

