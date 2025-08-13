from style import run_style_transfer
import time

if __name__ == '__main__':
    print("Starting the test script...")

    content_image_path = "../resources/building.jpeg"
    style_image_path = "../resources/van_gogh.jpeg"
    output_image_path = "output.jpg"

    start_time = time.time()

    run_style_transfer(
        content_img_path=content_image_path,
        style_img_path=style_image_path,
        output_path=output_image_path,
        num_steps=300
    )

    end_time = time.time()

    print(f"Script finished in {end_time - start_time:.2f} seconds.")

