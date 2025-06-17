# Use official Python image
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Copy all files to container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Flask/Gunicorn will run on
EXPOSE 5000

# Run Gunicorn as the production WSGI server
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
