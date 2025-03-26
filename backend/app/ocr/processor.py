from ultralytics import YOLO
from PIL import Image
from paddleocr import PaddleOCR
import cv2
import numpy as np
import os
from time import time

class PlateProcessor:
    def __init__(self, model_path):
        self.yolo_model = YOLO(model_path)
        self.ocr = PaddleOCR(use_angle_cls=True, lang='ar', det_db_box_thresh=0.7, det_db_unclip_ratio=1.7)
        self.debug_dir = './debug'
        os.makedirs(self.debug_dir, mode=0o755, exist_ok=True)

    def crop_plate(self, img_path):
        try:
            results = self.yolo_model.predict(source=img_path, conf=0.25)
            image = Image.open(img_path)

            for result in results:
                if result.boxes is not None and len(result.boxes) > 0:
                    max_width = -1
                    selected_box = None

                    for box in result.boxes:
                        res = box.xyxy[0]
                        width = res[2].item() - res[0].item()
                        if width > max_width:
                            max_width = width
                            selected_box = res

                    if selected_box is not None:
                        x_min, y_min, x_max, y_max = [selected_box[i].item() for i in range(4)]
                        return image.crop((x_min, y_min, x_max, y_max))
            return None
        except Exception as e:
            print(f"Error in crop_plate: {str(e)}")
            return None

    def detect_text(self, cropped_image):
        try:
            image = cv2.cvtColor(np.array(cropped_image), cv2.COLOR_RGB2BGR)
            height, width = image.shape[:2]
            mid_point = width // 2
            left_half = image[:, :mid_point, :]
            right_half = image[:, mid_point:, :]

            detected_texts = []
            texts_only = []

            for half in [left_half, right_half]:
                results = self.ocr.ocr(half, cls=True)
                if results and results[0]:
                    lower_box = max(results[0], key=lambda x: max([p[1] for p in x[0]]))
                    bbox, (text, prob) = lower_box
                    detected_texts.append((text, prob))
                    texts_only.append(text)

            fname = f"{self.debug_dir}/plate_{str(int(time()*1000)%10000000)}.jpg"
            cv2.imwrite(fname, np.hstack((left_half, right_half)))
            
            processed_texts = []
            for t in texts_only:
                t = t.replace(' ', '')
                processed_texts.append(t[::-1] if not (1569 <= ord(t[0]) <= 1610) else t)
            
            return {'texts': processed_texts, 'debug_image': fname}
        except Exception as e:
            print(f"Error in detect_text: {str(e)}")
            return None