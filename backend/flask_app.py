import os
from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS
from google import genai

app = Flask(__name__)
CORS(app)
client = genai.Client(api_key="AIzaSyAAY3_bAgSyiEfdNxZSZ38VUYtGRrS1ilg")

@app.route('/image', methods=["POST"])
def trip_reponse():

    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    uploaded_image = request.files['image']

    # Save the uploaded image to a temporary location
    temp_path = os.path.join("/tmp", uploaded_image.filename)
    uploaded_image.save(temp_path)

    try:
        # Now upload using the file path
        myfile = client.files.upload(file=temp_path)

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                myfile,
                "\n\n",
                "Analyze the image and describe its key visual elements.\n"
                "Infer the themes and emotional tone based on those elements.\n"
                "Recommend exactly 3 published books that relate to what's in the image.\n"
                "Verify that these 3 published books actually exist on Google Books.\n"
                "Format your entire response precisely as follows:\n\n"
                "Here's an analysis of the image and book recommendations:\n\n"
                "<Your brief analysis of image content, themes and emotional tone>\n\n"
                "* *Title1* by *Author1*: One-sentence description about why this book relates to the image.\n"
                "* *Title2* by *Author2*: One-sentence description about why this book relates to the image.\n"
                "* *Title3* by *Author3*: One-sentence description about why this book relates to the image.\n"
                "\n\n"
                "IMPORTANT FORMATTING RULES:\n"
                "1. Each book entry MUST be on its own line\n"
                "2. Each book entry MUST start with '* *' \n"
                "3. Book titles MUST be between single asterisks: *Title*\n"
                "4. Author names MUST be between single asterisks: *Author*\n"
                "5. Descriptions MUST be concise and follow the colon\n"
                "6. DO NOT add any additional text or sections beyond what's specified above\n"
            ],
        )

        return jsonify(response.text)

    finally:
        # Clean up the temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
