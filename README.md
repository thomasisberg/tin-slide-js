# TinSlide
A dependency free content slider for Javascript

## Documentation and examples
It's certainly a work in progress, but you can test drive TinSlide at [tin-slide.com](https://tin-slide.com "TinSlide website")

## Installation options
```
yarn add tin-slide --save
```
```
npm install tin-slide --save
```
```
bower install tin-slide --save
```

## Usage
As a module
```js
import TinSlide from 'tin-slide';

TinSlide(document.getElementById('TinSlide'), {
    // Options.
});
```

### Script tag
You can choose to load the script separately, or implement the script in your pre processor any way you like.
```html
<script src="node_modules/tin-slide/dist/tin-slide.js"></script>
```

## License
[MIT](LICENSE)