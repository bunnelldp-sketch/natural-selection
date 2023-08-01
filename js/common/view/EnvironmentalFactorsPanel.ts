// Copyright 2019-2023, University of Colorado Boulder

/**
 * EnvironmentalFactorsPanel is the panel that contains controls for environmental factors that affect
 * the mortality of bunnies.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { combineOptions, optionize4 } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import { AlignGroup, Text, VBox, VBoxOptions } from '../../../../scenery/js/imports.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionStrings from '../../NaturalSelectionStrings.js';
import NaturalSelectionConstants from '../NaturalSelectionConstants.js';
import LimitedFoodCheckbox from './LimitedFoodCheckbox.js';
import NaturalSelectionPanel, { NaturalSelectionPanelOptions } from './NaturalSelectionPanel.js';
import ToughFoodCheckbox from './ToughFoodCheckbox.js';
import WolvesCheckbox from './WolvesCheckbox.js';
import DerivedStringProperty from '../../../../axon/js/DerivedStringProperty.js';

type SelfOptions = {
  toughFoodCheckboxVisible?: boolean;
};

type EnvironmentalFactorsPanelOptions = SelfOptions & NaturalSelectionPanelOptions;

export default class EnvironmentalFactorsPanel extends NaturalSelectionPanel {

  public constructor( wolvesEnabledProperty: Property<boolean>, foodIsToughProperty: Property<boolean>,
                      foodIsLimitedProperty: Property<boolean>, providedOptions: EnvironmentalFactorsPanelOptions ) {

    const options = optionize4<EnvironmentalFactorsPanelOptions, SelfOptions, StrictOmit<NaturalSelectionPanelOptions, 'tandem'>>()(
      {}, NaturalSelectionConstants.PANEL_OPTIONS, {

        // SelfOptions
        toughFoodCheckboxVisible: true,

        // NaturalSelectionPanelOptions
        visiblePropertyOptions: {
          phetioFeatured: true
        }
      }, providedOptions );

    // To make all checkbox labels have the same effective size
    const checkboxLabelAlignGroup = new AlignGroup();

    // A checkbox for each environmental factor
    const wolvesCheckbox = new WolvesCheckbox( wolvesEnabledProperty, checkboxLabelAlignGroup, {
      tandem: options.tandem.createTandem( 'wolvesCheckbox' )
    } );
    const toughFoodCheckbox = new ToughFoodCheckbox( foodIsToughProperty, checkboxLabelAlignGroup, {
      visible: options.toughFoodCheckboxVisible,
      tandem: options.tandem.createTandem( 'toughFoodCheckbox' )
    } );
    const limitedFoodCheckbox = new LimitedFoodCheckbox( foodIsLimitedProperty, checkboxLabelAlignGroup, {
      tandem: options.tandem.createTandem( 'limitedFoodCheckbox' )
    } );
    const checkboxes = [ wolvesCheckbox, toughFoodCheckbox, limitedFoodCheckbox ];

    // Checkbox currently has a limitation with adjusting its content size after instantiation, which is the case with
    // these checkboxes that use AlignGroup. So this forces the pointer areas to be recomputed, and also dilates the
    // pointer areas to fill vertical space between the checkboxes.
    // See https://github.com/phetsims/natural-selection/issues/145 and https://github.com/phetsims/natural-selection/issues/173
    const xDilation = 8;
    const ySpacing = NaturalSelectionConstants.VBOX_OPTIONS.spacing!;
    assert && assert( ySpacing !== undefined );
    const yDilation = ySpacing / 2;
    checkboxes.forEach( checkbox => {
      checkbox.localBoundsProperty.link( localBounds => {
        checkbox.touchArea = checkbox.localBounds.dilatedXY( xDilation, yDilation );
        checkbox.mouseArea = checkbox.localBounds.dilatedXY( xDilation, yDilation );
      } );
    } );

    const numberOfCheckboxesVisibleProperty = DerivedProperty.deriveAny(
      checkboxes.map( checkbox => checkbox.visibleProperty ),
      () => _.filter( checkboxes, checkbox => checkbox.visible ).length, {
        tandem: options.tandem.createTandem( 'numberOfCheckboxesVisibleProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'the number of checkboxes that are visible affects whether the panel title is singular or plural'
      } );

    // title
    const titleStringProperty = new DerivedStringProperty( [
      numberOfCheckboxesVisibleProperty,
      NaturalSelectionStrings.environmentalFactorStringProperty,
      NaturalSelectionStrings.environmentalFactorsStringProperty
    ], ( numberOfCheckboxesVisible, environmentalFactor, environmentalFactors ) =>
      ( numberOfCheckboxesVisible === 1 ) ? environmentalFactor : environmentalFactors, {
      tandem: options.tandem.createTandem( 'titleStringProperty' )
    } );
    const titleText = new Text( titleStringProperty, {
      font: NaturalSelectionConstants.TITLE_FONT,
      maxWidth: 175 // determined empirically,
    } );

    const content = new VBox( combineOptions<VBoxOptions>( {}, NaturalSelectionConstants.VBOX_OPTIONS, {
      children: [ titleText, ...checkboxes ]
    } ) );

    super( content, options );
  }
}

naturalSelection.register( 'EnvironmentalFactorsPanel', EnvironmentalFactorsPanel );