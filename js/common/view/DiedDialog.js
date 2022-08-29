// Copyright 2019-2022, University of Colorado Boulder

/**
 * DiedDialog is displayed when all of the bunnies have died.
 * It displays the message "All of the bunnies have died."
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Text } from '../../../../scenery/js/imports.js';
import Dialog from '../../../../sun/js/Dialog.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import naturalSelection from '../../naturalSelection.js';
import naturalSelectionStrings from '../../naturalSelectionStrings.js';
import NaturalSelectionConstants from '../NaturalSelectionConstants.js';

class DiedDialog extends Dialog {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {}, NaturalSelectionConstants.DIALOG_OPTIONS, {
      topMargin: 50,
      bottomMargin: 50,

      // phet-io
      tandem: Tandem.REQUIRED, // see https://github.com/phetsims/natural-selection/issues/156
      phetioReadOnly: true,
      phetioDocumentation: 'This dialog is displayed when all of the bunnies have died.'
    }, options );

    const textNode = new Text( naturalSelectionStrings.allOfTheBunniesHaveDiedStringProperty, {
      font: NaturalSelectionConstants.DIALOG_FONT,
      maxWidth: 450, // determined empirically
      tandem: options.tandem.createTandem( 'textNode' ),
      phetioVisiblePropertyInstrumented: false
    } );

    super( textNode, options );
  }
}

naturalSelection.register( 'DiedDialog', DiedDialog );
export default DiedDialog;