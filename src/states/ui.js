import { extendObservable, computed } from 'mobx';
import { POINTS } from '../constants/points';

class UI {
    constructor() {
        extendObservable(this, {
            selected: 40,
            options: [40, 200, 500],
            points: computed(() => {
                return POINTS[this.selected];
            })
        });
    }


}

export default UI;