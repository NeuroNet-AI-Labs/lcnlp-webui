from flask import Flask, render_template, request, jsonify
from launcher.generators.ai.nlp_gen_v1 import AdvancedTextGenerator
from launcher.utils.devices.device_manager import DeviceManager

app = Flask(__name__)

generator = AdvancedTextGenerator(model_name='gpt2', device_id='cpu')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt')
    max_length = data.get('max_length', 50)
    temperature = data.get('temperature', 1.0)
    top_k = data.get('top_k', 50)
    top_p = data.get('top_p', 0.95)
    repetition_penalty = data.get('repetition_penalty', 1.0)

    generated_text = generator.generate_text(
        prompt,
        max_length=max_length,
        temperature=temperature,
        top_k=top_k,
        top_p=top_p,
        repetition_penalty=repetition_penalty
    )
    return jsonify({'generated_text': generated_text})


@app.route('/devices')
def devices():
    devices = DeviceManager()._get_available_devices()
    return jsonify({'devices': devices})


@app.route('/update_model', methods=['POST'])
def update_model():
    data = request.json
    model_name = data.get('model_name')
    generator.load_model(model_name)
    return jsonify({'status': 'Model updated'})


@app.route('/update_device', methods=['POST'])
def update_device():
    data = request.json
    device_id = data.get('device_id')
    generator.set_device(device_id)
    generator.model.to(generator.device)
    return jsonify({'status': 'Device updated'})


if __name__ == '__main__':
    app.run(debug=True)
