// Copyright 2019-2021, University of Colorado Boulder

/**
 * CancelMutationButton is the button that appears in the 'Mutation Coming' alert, used to cancel a mutation.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import timesCircleRegularShape from '../../../../sherpa/js/fontawesome-5/timesCircleRegularShape.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import naturalSelection from '../../naturalSelection.js';

class CancelMutationButton extends RoundPushButton {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {

      // so we see only the icon
      xMargin: 0,
      yMargin: 0,
      baseColor: 'transparent',

      // red 'x' inside a circle
      content: new Path( timesCircleRegularShape, {
        fill: PhetColorScheme.RED_COLORBLIND,
        scale: 0.035,
        cursor: 'pointer'
      } ),

      touchAreaDilation: 8,
      mouseAreaDilation: 4,

      // phet-io
      tandem: Tandem.OPTIONAL // because we don't want to instrument this button
    }, options );

    super( options );
  }
}

naturalSelection.register( 'CancelMutationButton', CancelMutationButton );
export default CancelMutationButton;