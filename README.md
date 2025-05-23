# Download Files By URL

Download Files By URL and Save Them in specifique path

**Note**: if file name already exist the new file name is with a random number

## Methods Exist

1. Download One
1. Download Many

## Usage

```JS
const file_name = "image.png";
const link = `https://`;
const Dld = new Download();

async function run() {
  // Download One
  await Dld.download_one(link, { file_name });

  // Download Many
  await Dld.download_many({ link, file_name }, { link, file_name }, { link, file_name });
}

run();
```
