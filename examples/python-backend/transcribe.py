import argparse
from natlaskit import NatlasClient

parser = argparse.ArgumentParser(description="Transcribe audio with natlaskit")
parser.add_argument("audio")
parser.add_argument(
    "--language", default="english", choices=["hausa", "yoruba", "igbo", "english"]
)
parser.add_argument("--endpoint", default="http://127.0.0.1:8000")
args = parser.parse_args()
with NatlasClient(base_url=args.endpoint) as client:
    print(client.transcribe(args.audio, language=args.language).text)
